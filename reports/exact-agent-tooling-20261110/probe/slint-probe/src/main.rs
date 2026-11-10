fn main() -> Result<(), slint::PlatformError> {
    use slint::ComponentHandle;
    let app = slint_probe::ui::SettingsPage::new()?;
    app.set_files(slint_probe::sample_files());
    app.run()
}
