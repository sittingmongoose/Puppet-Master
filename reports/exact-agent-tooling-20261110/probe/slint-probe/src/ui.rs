slint::slint! {
    import { Button, CheckBox, LineEdit, Switch, ComboBox, Slider, VerticalBox, HorizontalBox, GroupBox } from "std-widgets.slint";

    export struct FileRow { key: string, name: string }

    component SettingRow inherits HorizontalBox {
        in property <string> label;
        Text { text: root.label; vertical-alignment: center; }
        @children
    }

    export component SettingsPage inherits Window {
        title: "Probe: Settings > GitHub";
        width: 720px; height: 860px;
        in-out property <int> connect-count: 0;
        in-out property <string> last-command: "";
        in-out property <string> last-copied: "";
        in-out property <bool> panel-open: false;
        in-out property <bool> overlay-on: false;
        in-out property <int> overlay-hits: 0;
        in-out property <int> save-count: 0;
        in property <[FileRow]> files;
        out property <length> panel-x: panel.x;
        callback dispatch(string);
        dispatch(id) => { root.last-command = id; }

        VerticalBox {
            heading := Text { text: "GitHub"; font-size: 20px; accessible-role: text; }
            GroupBox {
                title: "Account";
                VerticalBox {
                    SettingRow { label: "Sign in";
                        btn-github-connect := Button { text: "Connect"; accessible-id: "btn.github.connect"; clicked => { root.connect-count += 1; root.dispatch("cmd.github.connect"); } }
                        btn-github-disconnect := Button { text: "Disconnect"; accessible-id: "btn.github.disconnect"; enabled: root.connect-count > 0; clicked => { root.dispatch("cmd.github.disconnect"); } }
                    }
                    SettingRow { label: "Host";
                        input-github-host := LineEdit { placeholder-text: "github.com"; accessible-id: "settings.github.host"; }
                    }
                    SettingRow { label: "Default branch";
                        input-default-branch := LineEdit { text: "main"; accessible-id: "settings.github.default_branch"; }
                    }
                }
            }
            GroupBox {
                title: "Behaviour";
                VerticalBox {
                    SettingRow { label: "Open pull requests as drafts"; sw-draft-prs := Switch { checked: true; accessible-id: "settings.github.draft_prs"; } }
                    SettingRow { label: "Sign commits"; sw-sign-commits := Switch { accessible-id: "settings.github.sign_commits"; } }
                    SettingRow { label: "Auto-fetch"; cb-auto-fetch := CheckBox { text: "Every"; checked: true; accessible-id: "settings.github.auto_fetch"; } sl-fetch-minutes := Slider { minimum: 1; maximum: 60; value: 15; accessible-id: "settings.github.fetch_minutes"; } }
                    SettingRow { label: "Merge method"; combo-merge-method := ComboBox { model: ["Merge commit", "Squash", "Rebase"]; current-index: 1; accessible-id: "settings.github.merge_method"; } }
                }
            }
            GroupBox {
                title: "Two controls that wrongly share one id";
                HorizontalBox {
                    Button { text: "Save"; accessible-id: "dup.save"; clicked => { root.save-count += 1; } }
                    Button { text: "Save"; accessible-id: "dup.save"; clicked => { root.save-count += 100; } }
                }
            }
            GroupBox {
                title: "Files (one repeated control per row)";
                VerticalBox {
                    for f in root.files: HorizontalBox {
                        Text { text: f.name; vertical-alignment: center; }
                        Button {
                            text: "Copy relative path";
                            accessible-id: "files.row.copy_path#" + f.key;
                            clicked => { root.last-copied = f.key; root.dispatch("cmd.file.copy_path"); }
                        }
                    }
                }
            }
            GroupBox {
                title: "Panel";
                HorizontalBox {
                    btn-toggle-panel := Button { text: "Toggle panel"; accessible-id: "ui.settings.toggle_panel"; clicked => { root.panel-open = !root.panel-open; root.dispatch("ui.settings.toggle_panel"); } }
                    status-last-command := Text { text: "last: " + root.last-command; accessible-role: text; }
                }
            }
            Rectangle {
                height: 40px;
                panel := Rectangle {
                    x: root.panel-open ? 300px : 0px;
                    width: 120px; height: 30px; background: #4a90d9;
                    animate x { duration: 300ms; easing: linear; }
                }
            }
        }
        // A cover over the whole window, as a modal scrim or a stray layer would be.
        if root.overlay-on: Rectangle {
            background: #00000040;
            TouchArea { clicked => { root.overlay-hits += 1; } }
        }
    }
}
