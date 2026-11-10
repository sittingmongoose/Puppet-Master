//! The smallest adapter over Slint's own test API (`i-slint-backend-testing`), compiled only with `--features testkit`.
//!
//! It adds four things stock Slint does not give in one place:
//!   1. addressing by the canonical id carried in `accessible-id` (stock lookup is by `Component::element-id`);
//!   2. refusal when an id matches no control or more than one, naming the candidates;
//!   3. a compact listing with a three-way enabled state (enabled, disabled, not stated);
//!   4. a receipt line per step that says which kind of input was used.
//! Input kinds are kept apart on purpose:
//!   `toolkit-pointer`  pointer move, press, 50 ms of mock time, release, at the control's centre, through the
//!                      window's own event dispatch, so hit testing and covering layers apply;
//!   `semantic-action`  the accessibility default action, which bypasses hit testing. Never counts as driving the control.
use i_slint_backend_testing::{AccessibleRole, ElementHandle, ElementQuery, ElementRoot};
use slint::platform::PointerEventButton;
use std::time::Duration;

/// The digest of the sources this binary was built from (see build.rs).
pub fn app_build_id() -> &'static str { env!("PROBE_APP_BUILD_ID") }

#[derive(Debug, PartialEq)]
pub enum Refusal {
    NoMatch { id: String },
    Ambiguous { id: String, candidates: Vec<String> },
    Disabled { id: String },
}

fn describe(e: &ElementHandle) -> String {
    let p = e.absolute_position();
    format!("{} {:?} at {},{} [{}]", role_name(e), e.accessible_label().unwrap_or_default().as_str(), p.x.round(), p.y.round(), e.id().unwrap_or_default())
}

fn role_name(e: &ElementHandle) -> String {
    match e.accessible_role() { Some(r) => format!("{r:?}"), None => e.type_name().map(|t| t.to_string()).unwrap_or_default() }
}

/// Every element whose `accessible-id` equals `id`.
pub fn matches(app: &impl ElementRoot, id: &str) -> Vec<ElementHandle> {
    all(app).into_iter().filter(|e| e.accessible_id().is_some_and(|a| a.as_str() == id)).collect()
}

/// Every element once. `ElementQuery::from_root(app).match_descendants().find_all()` returned the same control
/// several times in this probe on Slint 1.18.1 (six handles for one Button), so the adapter walks the tree itself.
pub fn all(app: &impl ElementRoot) -> Vec<ElementHandle> {
    let mut out = Vec::new();
    app.root_element().visit_descendants(|e| { out.push(e); std::ops::ControlFlow::<()>::Continue(()) });
    out
}

/// How many handles the stock descendant query returns for one `accessible-id` (kept to show the difference).
pub fn stock_query_count(app: &impl ElementRoot, id: &str) -> usize {
    let want = id.to_string();
    ElementQuery::from_root(app).match_descendants()
        .match_predicate(move |e| e.accessible_id().is_some_and(|a| a.as_str() == want)).find_all().len()
}

/// Exactly one control, or a refusal that names what was found.
pub fn find(app: &impl ElementRoot, id: &str) -> Result<ElementHandle, Refusal> {
    let mut m = matches(app, id);
    match m.len() {
        0 => Err(Refusal::NoMatch { id: id.into() }),
        1 => Ok(m.remove(0)),
        _ => Err(Refusal::Ambiguous { id: id.into(), candidates: m.iter().map(describe).collect() }),
    }
}

#[derive(Debug, Clone)]
pub struct Step { pub op: &'static str, pub id: String, pub input: &'static str, pub mock_ms: u64, pub at: (f32, f32) }
impl Step {
    pub fn json(&self) -> String {
        format!("{{\"op\":\"{}\",\"id\":\"{}\",\"input\":\"{}\",\"mock_ms\":{},\"at\":[{},{}]}}", self.op, self.id, self.input, self.mock_ms, self.at.0, self.at.1)
    }
}

fn centre(e: &ElementHandle) -> (f32, f32) {
    let (p, s) = (e.absolute_position(), e.size());
    (p.x + s.width / 2., p.y + s.height / 2.)
}

/// A toolkit pointer click on mock time. Refuses a control that states it is disabled.
pub fn tap(app: &impl ElementRoot, id: &str) -> Result<Step, Refusal> {
    let e = find(app, id)?;
    if e.accessible_enabled() == Some(false) { return Err(Refusal::Disabled { id: id.into() }); }
    let before = i_slint_backend_testing::get_mocked_time();
    e.mock_single_click(PointerEventButton::Left);
    Ok(Step { op: "tap", id: id.into(), input: "toolkit-pointer", mock_ms: i_slint_backend_testing::get_mocked_time() - before, at: centre(&e) })
}

/// The accessibility default action. Labelled apart from `tap`: it reaches a covered control.
pub fn activate(app: &impl ElementRoot, id: &str) -> Result<Step, Refusal> {
    let e = find(app, id)?;
    e.invoke_accessible_default_action();
    Ok(Step { op: "activate", id: id.into(), input: "semantic-action", mock_ms: 0, at: centre(&e) })
}

pub fn advance(ms: u64) -> Step {
    i_slint_backend_testing::mock_elapsed_time(Duration::from_millis(ms));
    Step { op: "advance", id: String::new(), input: "mock-time", mock_ms: ms, at: (0., 0.) }
}

fn interactive(role: Option<AccessibleRole>) -> bool {
    !matches!(role, None | Some(AccessibleRole::None) | Some(AccessibleRole::Text) | Some(AccessibleRole::Groupbox))
}

/// One line per interactive control: role, canonical id, source id, label, value, state.
/// `accessible_enabled()` is an Option here, so "not stated" stays distinct from "disabled".
pub fn list(app: &impl ElementRoot) -> String {
    let all = all(app);
    let mut out = Vec::new();
    for e in all.iter().filter(|e| interactive(e.accessible_role())) {
        let mut line = role_name(e);
        match e.accessible_id() { Some(a) => line += &format!(" [{a}]"), None => line += " [no accessible-id]" }
        if let Some(src) = e.id() { line += &format!(" <{src}>"); }
        line += &format!(" {:?}", e.accessible_label().unwrap_or_default().as_str());
        if let Some(v) = e.accessible_value().filter(|v| !v.is_empty()) { line += &format!(" value={:?}", v.as_str()); }
        match e.accessible_enabled() { Some(false) => line += " disabled", None => line += " enabled-not-stated", Some(true) => {} }
        if e.accessible_checked() == Some(true) { line += " checked"; }
        out.push(line);
    }
    out.join("\n")
}
