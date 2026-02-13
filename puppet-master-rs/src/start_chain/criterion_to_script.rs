//! Convert verification criteria to executable test scripts.

use std::collections::HashMap;
use std::path::PathBuf;

/// Type of verification criterion.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CriterionType {
    /// Regular expression match
    Regex,
    /// Shell command execution
    Command,
    /// File existence check
    FileExists,
    /// API endpoint check
    ApiResponse,
    /// Browser-based check
    BrowserCheck,
    /// AI-driven verification
    AiVerification,
    /// Custom script
    CustomScript,
}

/// A verification criterion to convert.
#[derive(Debug, Clone)]
pub struct VerificationCriterion {
    /// Criterion ID
    pub id: String,
    /// Human-readable description
    pub description: String,
    /// Type of criterion
    pub criterion_type: CriterionType,
    /// Target value (e.g., regex pattern, command, file path)
    pub target: String,
    /// Additional options
    pub options: HashMap<String, String>,
}

impl VerificationCriterion {
    /// Creates a new verification criterion.
    pub fn new(
        id: impl Into<String>,
        description: impl Into<String>,
        criterion_type: CriterionType,
        target: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            description: description.into(),
            criterion_type,
            target: target.into(),
            options: HashMap::new(),
        }
    }

    /// Adds an option and returns self for chaining.
    pub fn with_option(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.options.insert(key.into(), value.into());
        self
    }
}

/// Generated script output.
#[derive(Debug, Clone)]
pub struct GeneratedScript {
    /// Script content
    pub content: String,
    /// Suggested file path
    pub file_path: PathBuf,
    /// Script language/type
    pub script_type: ScriptType,
}

/// Type of generated script.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ScriptType {
    /// Shell script
    Shell,
    /// Rust test code
    Rust,
    /// Python script
    Python,
}

impl ScriptType {
    /// Returns the file extension for this script type.
    pub fn extension(&self) -> &'static str {
        match self {
            Self::Shell => "sh",
            Self::Rust => "rs",
            Self::Python => "py",
        }
    }

    /// Returns the shebang line for this script type.
    pub fn shebang(&self) -> &'static str {
        match self {
            Self::Shell => "#!/usr/bin/env bash",
            Self::Rust => "// Rust test code",
            Self::Python => "#!/usr/bin/env python3",
        }
    }
}

/// Converts verification criteria to executable scripts.
pub struct CriterionToScriptConverter {
    /// Output directory for scripts
    output_dir: PathBuf,
    /// Preferred script type
    _preferred_type: ScriptType,
}

impl CriterionToScriptConverter {
    /// Creates a new converter.
    pub fn new(output_dir: PathBuf, preferred_type: ScriptType) -> Self {
        Self {
            output_dir,
            _preferred_type: preferred_type,
        }
    }

    /// Converts a criterion to a script.
    pub fn convert(&self, criterion: &VerificationCriterion) -> Result<GeneratedScript, String> {
        match criterion.criterion_type {
            CriterionType::Regex => self.generate_regex_script(criterion),
            CriterionType::Command => self.generate_command_script(criterion),
            CriterionType::FileExists => self.generate_file_check_script(criterion),
            CriterionType::ApiResponse => self.generate_api_script(criterion),
            CriterionType::BrowserCheck => self.generate_browser_script(criterion),
            CriterionType::AiVerification => self.generate_ai_script(criterion),
            CriterionType::CustomScript => self.generate_custom_script(criterion),
        }
    }

    fn generate_regex_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}
set -e

# Verification: {}
# Type: Regex match
# Pattern: {}

TARGET_FILE="${{1:-}}"
if [ -z "$TARGET_FILE" ]; then
    echo "Usage: $0 <file_to_check>"
    exit 1
fi

if ! [ -f "$TARGET_FILE" ]; then
    echo "Error: File not found: $TARGET_FILE"
    exit 1
fi

PATTERN='{}'
if grep -qE "$PATTERN" "$TARGET_FILE"; then
    echo "[OK] Pattern matched in $TARGET_FILE"
    exit 0
else
    echo "[FAIL] Pattern not found in $TARGET_FILE"
    exit 1
fi
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn generate_command_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}
set -e

# Verification: {}
# Type: Command execution
# Command: {}

echo "Running verification command..."
if {}; then
    echo "[OK] Command succeeded"
    exit 0
else
    echo "[FAIL] Command failed"
    exit 1
fi
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn generate_file_check_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}
set -e

# Verification: {}
# Type: File existence check
# File: {}

TARGET_FILE="{}"
if [ -e "$TARGET_FILE" ]; then
    echo "[OK] File exists: $TARGET_FILE"
    exit 0
else
    echo "[FAIL] File not found: $TARGET_FILE"
    exit 1
fi
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn generate_api_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let expected_status = criterion
            .options
            .get("status")
            .unwrap_or(&"200".to_string())
            .clone();
        let content = format!(
            r#"{}
set -e

# Verification: {}
# Type: API response check
# Endpoint: {}

ENDPOINT="{}"
EXPECTED_STATUS={}

echo "Checking API endpoint: $ENDPOINT"
STATUS=$(curl -s -o /dev/null -w "%{{http_code}}" "$ENDPOINT")

if [ "$STATUS" -eq "$EXPECTED_STATUS" ]; then
    echo "[OK] API returned expected status: $STATUS"
    exit 0
else
    echo "[FAIL] API returned $STATUS, expected $EXPECTED_STATUS"
    exit 1
fi
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target,
            expected_status
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn generate_browser_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}

# Verification: {}
# Type: Browser check
# URL: {}

# NOTE: This is a placeholder. Implement browser automation as needed.
# Consider using Playwright, Selenium, or similar tools.

import sys

def check_browser():
    url = "{}"
    print(f"Checking browser at: {{url}}")
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=30000)
            title = page.title()
            print(f"[OK] Page loaded: {{title}}")
            browser.close()
            return True
    except ImportError:
        print("[WARN] Playwright not installed. Install with: pip install playwright && playwright install")
        return False
    except Exception as e:
        print(f"[FAIL] Browser check failed: {{e}}")
        return False

if __name__ == "__main__":
    success = check_browser()
    sys.exit(0 if success else 1)
"#,
            ScriptType::Python.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id).with_extension("py"),
            script_type: ScriptType::Python,
        })
    }

    fn generate_ai_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}
set -e

# Verification: {}
# Type: AI verification
# Description: {}

echo "AI verification placeholder - implement as needed"
echo "Description: {}"
exit 0
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn generate_custom_script(
        &self,
        criterion: &VerificationCriterion,
    ) -> Result<GeneratedScript, String> {
        let content = format!(
            r#"{}
set -e

# Custom verification: {}
# Target: {}

# Verify target exists/runs
TARGET="{}"
if [ -f "$TARGET" ]; then
    echo "[OK] Target file exists: $TARGET"
elif command -v "$TARGET" >/dev/null 2>&1; then
    echo "[OK] Target command found: $TARGET"
    $TARGET
else
    echo "[FAIL] Target not found: $TARGET"
    exit 1
fi
echo "[OK] Custom verification passed"
exit 0
"#,
            ScriptType::Shell.shebang(),
            criterion.description,
            criterion.target,
            criterion.target
        );

        Ok(GeneratedScript {
            content,
            file_path: self.script_path(&criterion.id),
            script_type: ScriptType::Shell,
        })
    }

    fn script_path(&self, id: &str) -> PathBuf {
        let filename = format!("verify_{}.sh", id.replace(':', "_").replace('/', "_"));
        self.output_dir.join(filename)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_script_type_extension() {
        assert_eq!(ScriptType::Shell.extension(), "sh");
        assert_eq!(ScriptType::Rust.extension(), "rs");
        assert_eq!(ScriptType::Python.extension(), "py");
    }

    #[test]
    fn test_criterion_builder() {
        let criterion = VerificationCriterion::new(
            "TEST-001",
            "Check API endpoint",
            CriterionType::ApiResponse,
            "http://localhost:8080/health",
        )
        .with_option("status", "200")
        .with_option("timeout", "5000");

        assert_eq!(criterion.id, "TEST-001");
        assert_eq!(criterion.criterion_type, CriterionType::ApiResponse);
        assert_eq!(criterion.options.get("status").unwrap(), "200");
    }

    #[test]
    fn test_generate_regex_script() {
        let converter =
            CriterionToScriptConverter::new(PathBuf::from("/tmp/scripts"), ScriptType::Shell);

        let criterion = VerificationCriterion::new(
            "REG-001",
            "Check for error message",
            CriterionType::Regex,
            "ERROR:.*failed",
        );

        let script = converter.convert(&criterion).unwrap();
        assert!(script.content.contains("ERROR:.*failed"));
        assert!(script.content.contains("grep -qE"));
        assert_eq!(script.script_type, ScriptType::Shell);
    }

    #[test]
    fn test_generate_file_check_script() {
        let converter =
            CriterionToScriptConverter::new(PathBuf::from("/tmp/scripts"), ScriptType::Shell);

        let criterion = VerificationCriterion::new(
            "FILE-001",
            "Check config file exists",
            CriterionType::FileExists,
            "/etc/app/config.json",
        );

        let script = converter.convert(&criterion).unwrap();
        assert!(script.content.contains("/etc/app/config.json"));
        assert!(script.content.contains("[ -e \"$TARGET_FILE\" ]"));
    }

    #[test]
    fn test_generate_command_script() {
        let converter =
            CriterionToScriptConverter::new(PathBuf::from("/tmp/scripts"), ScriptType::Shell);

        let criterion = VerificationCriterion::new(
            "CMD-001",
            "Run unit tests",
            CriterionType::Command,
            "npm test",
        );

        let script = converter.convert(&criterion).unwrap();
        assert!(script.content.contains("npm test"));
        assert!(script.content.contains("Running verification command"));
    }
}
