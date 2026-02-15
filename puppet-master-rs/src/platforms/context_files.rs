use std::path::{Path, PathBuf};

// DRY:FN:format_prompt_attachments
/// Formats `context_files` for platforms that accept file references inline in the prompt.
///
/// For Gemini/Copilot we use `@path` tokens, which the CLI interprets as an attachment.
pub fn format_prompt_attachments(context_files: &[PathBuf], token_prefix: &str) -> String {
    if context_files.is_empty() {
        return String::new();
    }

    let mut out = String::from("\n\nReference attachments:\n");
    for p in context_files {
        out.push_str("- ");
        out.push_str(token_prefix);
        out.push_str(&p.to_string_lossy());
        out.push('\n');
    }
    out
}

// DRY:FN:append_prompt_attachments
pub fn append_prompt_attachments(
    prompt: &str,
    context_files: &[PathBuf],
    token_prefix: &str,
) -> String {
    let attachments = format_prompt_attachments(context_files, token_prefix);
    if attachments.is_empty() {
        prompt.to_string()
    } else {
        format!("{}{}", prompt, attachments)
    }
}

// DRY:FN:context_file_parent_dirs
/// Returns a conservative allow-list of directories derived from `context_files`.
///
/// Many CLIs require directories for additional file access (e.g., `--add-dir`).
/// We include the parent directory of each file and de-duplicate.
pub fn context_file_parent_dirs(context_files: &[PathBuf]) -> Vec<PathBuf> {
    let mut dirs: Vec<PathBuf> = Vec::new();
    for p in context_files {
        if let Some(parent) = p.parent() {
            let parent = parent.to_path_buf();
            if !dirs.iter().any(|d| d == &parent) {
                dirs.push(parent);
            }
        }
    }
    dirs
}

// DRY:FN:has_image_extension
pub fn has_image_extension(path: &Path) -> bool {
    let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
        return false;
    };
    matches!(
        ext.to_ascii_lowercase().as_str(),
        "png" | "jpg" | "jpeg" | "gif" | "webp"
    )
}
