//! Start chain types for project initialization.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Parsed requirements from user input.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedRequirements {
    /// Project name.
    pub project_name: String,
    /// Project description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Requirements sections.
    pub sections: Vec<RequirementsSection>,
    /// When requirements were parsed.
    pub parsed_at: DateTime<Utc>,
}

impl ParsedRequirements {
    /// Creates new parsed requirements.
    pub fn new(project_name: impl Into<String>) -> Self {
        Self {
            project_name: project_name.into(),
            description: None,
            sections: Vec::new(),
            parsed_at: Utc::now(),
        }
    }

    /// Sets the description.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Adds a section.
    pub fn with_section(mut self, section: RequirementsSection) -> Self {
        self.sections.push(section);
        self
    }
}

/// A section of requirements.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementsSection {
    /// Section title.
    pub title: String,
    /// Section content.
    pub content: String,
    /// Section type (e.g., "functional", "technical", "constraints").
    #[serde(skip_serializing_if = "Option::is_none")]
    pub section_type: Option<String>,
    /// Priority of this section.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority: Option<super::prd::Priority>,
}

impl RequirementsSection {
    /// Creates a new requirements section.
    pub fn new(title: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            content: content.into(),
            section_type: None,
            priority: None,
        }
    }

    /// Sets the section type.
    pub fn with_type(mut self, section_type: impl Into<String>) -> Self {
        self.section_type = Some(section_type.into());
        self
    }

    /// Sets the priority.
    pub fn with_priority(mut self, priority: super::prd::Priority) -> Self {
        self.priority = Some(priority);
        self
    }
}

/// Project information for start chain.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfo {
    /// Project name.
    pub name: String,
    /// Project path.
    pub path: PathBuf,
    /// Project description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// When the project was created.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
    /// Last modified time.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified_at: Option<DateTime<Utc>>,
    /// Whether the project has a PRD.
    #[serde(default)]
    pub has_prd: bool,
    /// Whether the project has AGENTS.md.
    #[serde(default)]
    pub has_agents: bool,
}

impl ProjectInfo {
    /// Creates new project info.
    pub fn new(name: impl Into<String>, path: PathBuf) -> Self {
        Self {
            name: name.into(),
            path,
            description: None,
            created_at: Some(Utc::now()),
            modified_at: Some(Utc::now()),
            has_prd: false,
            has_agents: false,
        }
    }

    /// Sets the description.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Marks as having a PRD.
    pub fn with_prd(mut self) -> Self {
        self.has_prd = true;
        self
    }

    /// Marks as having AGENTS.md.
    pub fn with_agents(mut self) -> Self {
        self.has_agents = true;
        self
    }
}

/// AGENTS.md documentation structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentsDoc {
    /// Project name.
    pub project_name: String,
    /// Agent definitions.
    pub agents: Vec<AgentDefinition>,
    /// When the document was created.
    pub created_at: DateTime<Utc>,
    /// Last updated time.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,
}

impl AgentsDoc {
    /// Creates a new agents document.
    pub fn new(project_name: impl Into<String>) -> Self {
        Self {
            project_name: project_name.into(),
            agents: Vec::new(),
            created_at: Utc::now(),
            updated_at: None,
        }
    }

    /// Adds an agent.
    pub fn with_agent(mut self, agent: AgentDefinition) -> Self {
        self.agents.push(agent);
        self
    }
}

/// Definition of an agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentDefinition {
    /// Agent name.
    pub name: String,
    /// Agent role/type.
    pub role: String,
    /// Agent description.
    pub description: String,
    /// Capabilities of the agent.
    #[serde(default)]
    pub capabilities: Vec<String>,
    /// Platform the agent uses.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform: Option<super::platform::Platform>,
    /// Model the agent uses.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
}

impl AgentDefinition {
    /// Creates a new agent definition.
    pub fn new(
        name: impl Into<String>,
        role: impl Into<String>,
        description: impl Into<String>,
    ) -> Self {
        Self {
            name: name.into(),
            role: role.into(),
            description: description.into(),
            capabilities: Vec::new(),
            platform: None,
            model: None,
        }
    }

    /// Adds a capability.
    pub fn with_capability(mut self, capability: impl Into<String>) -> Self {
        self.capabilities.push(capability.into());
        self
    }

    /// Sets the platform.
    pub fn with_platform(mut self, platform: super::platform::Platform) -> Self {
        self.platform = Some(platform);
        self
    }

    /// Sets the model.
    pub fn with_model(mut self, model: impl Into<String>) -> Self {
        self.model = Some(model.into());
        self
    }
}

/// Progress tracking entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressEntry {
    /// Item ID this progress is for.
    pub item_id: String,
    /// Current status.
    pub status: super::prd::ItemStatus,
    /// Progress percentage (0.0 to 100.0).
    pub progress: f64,
    /// Progress message.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    /// Timestamp of this entry.
    pub timestamp: DateTime<Utc>,
}

impl ProgressEntry {
    /// Creates a new progress entry.
    pub fn new(item_id: impl Into<String>, status: super::prd::ItemStatus, progress: f64) -> Self {
        Self {
            item_id: item_id.into(),
            status,
            progress: progress.clamp(0.0, 100.0),
            message: None,
            timestamp: Utc::now(),
        }
    }

    /// Sets the message.
    pub fn with_message(mut self, message: impl Into<String>) -> Self {
        self.message = Some(message.into());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parsed_requirements() {
        let reqs = ParsedRequirements::new("MyProject")
            .with_description("A test project")
            .with_section(RequirementsSection::new("Overview", "Project overview"));

        assert_eq!(reqs.project_name, "MyProject");
        assert_eq!(reqs.sections.len(), 1);
        assert_eq!(reqs.description, Some("A test project".to_string()));
    }

    #[test]
    fn test_requirements_section() {
        let section = RequirementsSection::new("Functional", "User can login")
            .with_type("functional")
            .with_priority(super::super::prd::Priority::High);

        assert_eq!(section.title, "Functional");
        assert_eq!(section.section_type, Some("functional".to_string()));
    }

    #[test]
    fn test_project_info() {
        let info = ProjectInfo::new("MyProject", PathBuf::from("/path/to/project"))
            .with_description("Test project")
            .with_prd()
            .with_agents();

        assert_eq!(info.name, "MyProject");
        assert!(info.has_prd);
        assert!(info.has_agents);
    }

    #[test]
    fn test_agents_doc() {
        let agent =
            AgentDefinition::new("Worker", "executor", "Executes tasks").with_capability("coding");

        let doc = AgentsDoc::new("MyProject").with_agent(agent);

        assert_eq!(doc.project_name, "MyProject");
        assert_eq!(doc.agents.len(), 1);
    }

    #[test]
    fn test_progress_entry() {
        let entry = ProgressEntry::new("task1", super::super::prd::ItemStatus::Running, 50.0)
            .with_message("Half done");

        assert_eq!(entry.item_id, "task1");
        assert_eq!(entry.progress, 50.0);
        assert_eq!(entry.message, Some("Half done".to_string()));
    }
}
