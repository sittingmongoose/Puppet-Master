pub mod ui;
#[cfg(feature = "testkit")]
pub mod testkit;

/// Three rows with stable keys, as a wiring-row item key would be.
pub fn sample_files() -> slint::ModelRc<ui::FileRow> {
    let rows = [("k-compose", "docker-compose.yml"), ("k-docker", "Dockerfile"), ("k-unraid", "unraid-template.xml")];
    slint::ModelRc::new(slint::VecModel::from(
        rows.iter().map(|(k, n)| ui::FileRow { key: (*k).into(), name: (*n).into() }).collect::<Vec<_>>(),
    ))
}
