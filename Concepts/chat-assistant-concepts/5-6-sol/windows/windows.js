import { escapeHtml } from "../shared/definitions.js";
import { icon } from "../shared/icons.js";
import { button, iconOnlyButton, renderArtifactContent, renderArtifactSwitcher, renderHistoryFilter, renderHistoryHeader, renderHistoryRows } from "../shared/primitives.js";

function historyVisible(ui) {
  return ui.historyMode !== "closed";
}

function artifactVisible(ui) {
  return ui.artifact.state !== "closed";
}

function historyTools(ui) {
  return `<div class="history-mode-tools" aria-label="History geometry">
    ${button({ label: "Peek", action: "history-set", value: "peek", pressed: ui.historyMode === "peek", className: "mode-button" })}
    ${button({ label: "Compact", action: "history-set", value: "pinned compact", pressed: ui.historyMode === "pinned compact", className: "mode-button" })}
    ${button({ label: "Full", action: "history-set", value: "pinned full", pressed: ui.historyMode === "pinned full", className: "mode-button" })}
  </div>`;
}

function artifactTools(data, ui) {
  return `<div class="artifact-tools">${renderArtifactSwitcher(data, ui)}${ui.artifact.state === "closed" ? button({ label: "Open last artifact", action: "artifact-state", value: "ready", iconName: "artifact", className: "secondary-button" }) : ""}</div>`;
}

function windowLabel(number, title, description) {
  return `<div class="window-signature"><span>Window ${String(number).padStart(2, "0")}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
}

function renderAtlas(data, ui, threadHtml) {
  return `<section class="window-concept atlas-folio" data-window-concept="window-01">
    ${windowLabel(1, "Atlas Folio", "The conversation is a bound reading leaf; history and artifacts unfold from known seams.")}
    <div class="atlas-workspace">
      ${artifactVisible(ui) ? `<aside class="atlas-plate artifact-region" aria-label="Artifact foldout"><div class="plate-hinge" aria-hidden="true"></div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "foldout")}</aside>` : ""}
      ${historyVisible(ui) ? `<aside class="atlas-gutter history-region" aria-label="Pinned history folio">${renderHistoryHeader(ui, "Thread folio", "Persistent binding gutter")}${ui.historyMode === "pinned full" || ui.historyMode === "peek" ? renderHistoryFilter(ui) : ""}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "compact" : "folio")}${historyTools(ui)}</aside>` : ""}
      <article class="atlas-leaf chat-mount"><div class="leaf-marker"><span>${ui.mount === "popout" ? "Detached leaf" : "Bound leaf"}</span><i></i></div>${threadHtml}</article>
    </div>
  </section>`;
}

function renderStage(data, ui, threadHtml) {
  return `<section class="window-concept stage-bay" data-window-concept="window-02">
    ${windowLabel(2, "Stage Bay", "Conversation owns the stage. History waits backstage; artifacts enter a left scene bay.")}
    <div class="stage-workspace">
      ${artifactVisible(ui) ? `<aside class="scene-bay artifact-region" aria-label="Artifact scene bay"><div class="scene-header"><span>Scene bay</span>${icon("artifact")}</div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "scene")}</aside>` : ""}
      ${historyVisible(ui) ? `<aside class="cue-stack history-region" aria-label="History cue stack">${renderHistoryHeader(ui, "Cue stack", "Threads waiting backstage")}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "cues-compact" : "cues")}${historyTools(ui)}</aside>` : ""}
      <article class="proscenium chat-mount"><div class="stage-cue"><span class="cue-lamp ${ui.agentActive ? "is-on" : ""}"></span><span>${escapeHtml(ui.agentActive ? ui.workingSummary : "Stage settled")}</span></div><div class="curtain-rule" aria-hidden="true"></div>${threadHtml}</article>
    </div>
  </section>`;
}

function renderSignal(data, ui, threadHtml) {
  return `<section class="window-concept signal-house" data-window-concept="window-03">
    ${windowLabel(3, "Signal House", "A ruled dispatch lane joins a route-board history and separate artifact instruments.")}
    <div class="signal-workspace">
      ${artifactVisible(ui) ? `<aside class="instrument-table artifact-region" aria-label="Artifact instrument table"><header><span>Instrument table</span><strong>Selected output</strong></header>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "instrument")}</aside>` : ""}
      <div class="signal-main">
        ${historyVisible(ui) ? `<aside class="route-board history-region" aria-label="Thread route board"><div class="route-board-head">${renderHistoryHeader(ui, "Route board", "Lightweight thread dispatch")}${historyTools(ui)}</div>${ui.historyMode === "pinned full" || ui.historyMode === "peek" ? renderHistoryFilter(ui) : ""}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "track" : "board")}</aside>` : ""}
        <article class="dispatch-lane chat-mount"><div class="dispatch-index"><span>CHAT</span><strong>${String(ui.revision).padStart(4, "0")}</strong><span>${escapeHtml(ui.network.transport)}</span></div>${threadHtml}</article>
      </div>
    </div>
  </section>`;
}

function renderLens(data, ui, threadHtml) {
  return `<section class="window-concept lens-chamber" data-window-concept="window-04">
    ${windowLabel(4, "Lens Chamber", "Concentric focus zones keep conversation clear and supporting state calibrated.")}
    <div class="lens-workspace">
      ${artifactVisible(ui) ? `<aside class="calibration-plate artifact-region" aria-label="Artifact calibration plate"><div class="calibration-marks" aria-hidden="true"><i></i><i></i><i></i><i></i></div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "calibration")}</aside>` : ""}
      <div class="lens-assembly">
        ${historyVisible(ui) ? `<aside class="perimeter-band history-region" aria-label="Perimeter thread history"><div class="band-label"><span>Perimeter history</span>${historyTools(ui)}${iconOnlyButton({ label: "Close history", action: "history-set", value: "closed", iconName: "close" })}</div>${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "perimeter-compact" : "perimeter")}</aside>` : ""}
        <article class="conversation-aperture chat-mount"><div class="aperture-ring" aria-hidden="true"></div><div class="focus-calibration"><span>Focus plane</span><strong>${ui.context.ringPercent}%</strong></div>${threadHtml}</article>
      </div>
    </div>
  </section>`;
}

function renderDesk(data, ui, threadHtml) {
  return `<section class="window-concept field-desk" data-window-concept="window-05">
    ${windowLabel(5, "Field Desk", "Artifacts command the work board while Chat remains protected correspondence.")}
    <div class="desk-workspace">
      ${artifactVisible(ui) ? `<aside class="work-board artifact-region" aria-label="Artifact work board"><div class="board-rule" aria-hidden="true"></div><header><span>Working board</span><strong>Project-backed output</strong></header>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "board")}</aside>` : ""}
      <div class="correspondence-zone">
        <article class="correspondence-column chat-mount"><div class="desk-docket"><span>Current correspondence</span><span>${escapeHtml(ui.route.connection)}</span></div>${threadHtml}</article>
        ${historyVisible(ui) ? `<aside class="index-drawer history-region" aria-label="Thread index drawer"><div class="drawer-handle" aria-hidden="true"></div>${renderHistoryHeader(ui, "Index drawer", "Persistent thread index")}${ui.historyMode === "pinned full" || ui.historyMode === "peek" ? renderHistoryFilter(ui) : ""}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "drawer-compact" : "drawer")}${historyTools(ui)}</aside>` : ""}
      </div>
    </div>
  </section>`;
}

function renderTidal(data, ui, threadHtml) {
  return `<section class="window-concept tidal-shelf" data-window-concept="window-06">
    ${windowLabel(6, "Tidal Shelf", "Conversation flows through a steady channel; work collects in calm, inspectable banks.")}
    <div class="tidal-workspace">
      ${artifactVisible(ui) ? `<aside class="artifact-bank artifact-region" aria-label="Left artifact bank"><div class="bank-contour" aria-hidden="true"></div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "bank")}</aside>` : ""}
      <article class="conversation-current chat-mount"><div class="current-line" aria-hidden="true"><i></i><i></i><i></i></div>${threadHtml}</article>
      ${historyVisible(ui) ? `<aside class="history-reservoir history-region" aria-label="History reservoir">${renderHistoryHeader(ui, "Thread reservoir", "Persistent lightweight shells")}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "reservoir-compact" : "reservoir")}${historyTools(ui)}</aside>` : ""}
    </div>
  </section>`;
}

function renderConcourse(data, ui, threadHtml) {
  return `<section class="window-concept concourse" data-window-concept="window-07">
    ${windowLabel(7, "Concourse", "A main reading passage connects a history mezzanine to a left artifact hall.")}
    <div class="concourse-workspace">
      ${artifactVisible(ui) ? `<aside class="artifact-hall artifact-region" aria-label="Artifact hall"><div class="wayfinding"><span>A</span><strong>Artifact hall</strong>${icon("artifact")}</div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "hall")}</aside>` : ""}
      <div class="main-passage">
        ${historyVisible(ui) ? `<aside class="history-mezzanine history-region" aria-label="History mezzanine"><div class="mezzanine-wayfinding"><span>H</span><strong>Conversation mezzanine</strong>${historyTools(ui)}${iconOnlyButton({ label: "Close history", action: "history-set", value: "closed", iconName: "close" })}</div>${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "mezzanine-compact" : "mezzanine")}</aside>` : ""}
        <article class="chat-passage chat-mount"><div class="passage-marker"><span>CHAT</span><i></i><span>${escapeHtml(ui.mount)}</span></div>${threadHtml}</article>
      </div>
    </div>
  </section>`;
}

function renderQuiet(data, ui, threadHtml) {
  return `<section class="window-concept quiet-frame" data-window-concept="window-08">
    ${windowLabel(8, "Quiet Frame", "Proportion, rules, and typography separate workspace regions without ornamental surfaces.")}
    <div class="quiet-workspace">
      ${artifactVisible(ui) ? `<aside class="quiet-artifact artifact-region" aria-label="Artifact field"><div class="quiet-region-label">01 / ARTIFACT</div>${artifactTools(data, ui)}${renderArtifactContent(data, ui, "quiet")}</aside>` : ""}
      <article class="quiet-chat chat-mount"><div class="quiet-region-label">02 / CONVERSATION · ${escapeHtml(String(ui.chatWidth))} PX</div>${threadHtml}</article>
      ${historyVisible(ui) ? `<aside class="measurement-gutter history-region" aria-label="History measurement gutter"><div class="quiet-region-label">03 / HISTORY</div>${renderHistoryHeader(ui, "Thread register", "Measured sibling region")}${renderHistoryRows(data, ui, ui.historyMode === "pinned compact" ? "measure-compact" : "measure")}${historyTools(ui)}</aside>` : ""}
    </div>
  </section>`;
}

const renderers = {
  "window-01": renderAtlas,
  "window-02": renderStage,
  "window-03": renderSignal,
  "window-04": renderLens,
  "window-05": renderDesk,
  "window-06": renderTidal,
  "window-07": renderConcourse,
  "window-08": renderQuiet
};

export function renderWindowConcept(data, ui, threadHtml) {
  const renderer = renderers[ui.selectedWindow] ?? renderAtlas;
  return renderer(data, ui, threadHtml);
}
