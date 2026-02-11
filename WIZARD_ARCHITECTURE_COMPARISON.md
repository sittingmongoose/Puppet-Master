# Wizard Architecture Comparison: TypeScript vs Rust

## TypeScript Architecture (COMPLETE)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACE                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  PlatformSetupWizard.tsx                                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │   │
│  │  │  Install   │→ │    Auth    │→ │    Save    │                │   │
│  │  │  Platforms │  │  Platforms │  │  Config    │                │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │   │
│  │        │               │               │                         │   │
│  │        ▼               ▼               ▼                         │   │
│  │   api.install    api.login    api.selectPlatforms               │   │
│  └────────┼──────────────┼──────────────┼──────────────────────────┘   │
│           │              │              │                               │
│  ┌────────┼──────────────┼──────────────┼──────────────────────────┐   │
│  │  Wizard.tsx                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│   │
│  │  │  Upload    │→ │  Generate  │→ │   Review   │→ │   Start    ││   │
│  │  │   Reqs     │  │    PRD     │  │    Plan    │  │  Project   ││   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘│   │
│  │        │               │               │               │         │   │
│  │        ▼               ▼               ▼               ▼         │   │
│  │  api.wizardUpload  api.wizardGenerate  api.wizardSave  api.start│   │
│  └────────┼──────────────┼──────────────┼──────────────┼──────────┘   │
└───────────┼──────────────┼──────────────┼──────────────┼──────────────┘
            │              │              │              │
            │              │              │              │
            ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS API SERVER                              │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  routes/platforms.ts                                              │ │
│  │  ┌──────────────────────────────────────────────────────────────┐│ │
│  │  │  POST /api/platforms/install                                  ││ │
│  │  │    ├─► PlatformDetector.detectPlatform()                     ││ │
│  │  │    ├─► InstallManager.installPlatform()                      ││ │
│  │  │    └─► spawn npm/pip install commands                        ││ │
│  │  │                                                               ││ │
│  │  │  POST /api/platforms/login                                   ││ │
│  │  │    ├─► AuthManager.initiatePlatformLogin()                   ││ │
│  │  │    ├─► Open browser for OAuth                                ││ │
│  │  │    └─► Poll for auth completion                              ││ │
│  │  │                                                               ││ │
│  │  │  GET /api/platforms/status                                   ││ │
│  │  │    └─► PlatformRegistry.checkAllPlatforms()                  ││ │
│  │  │                                                               ││ │
│  │  │  POST /api/platforms/select                                  ││ │
│  │  │    └─► ConfigManager.savePlatformSelection()                 ││ │
│  │  └──────────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  routes/wizard.ts                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────────┐│ │
│  │  │  POST /api/wizard/upload                                      ││ │
│  │  │    ├─► MarkdownParser.parse()                                ││ │
│  │  │    ├─► TextParser.parse()                                    ││ │
│  │  │    ├─► PdfParser.parse()                                     ││ │
│  │  │    └─► DocxParser.parse()                                    ││ │
│  │  │    └─► Returns: ParsedRequirements                           ││ │
│  │  │                                                               ││ │
│  │  │  POST /api/wizard/generate                                   ││ │
│  │  │    ├─► PrdGenerator.generateWithAI(parsed)                   ││ │
│  │  │    │     ├─► Platform selection (config.startChain.prd)      ││ │
│  │  │    │     ├─► LLM API call (Cursor/Claude/etc)                ││ │
│  │  │    │     └─► Returns: PRD object                             ││ │
│  │  │    │                                                          ││ │
│  │  │    ├─► ArchGenerator.generateWithAI(parsed, prd)             ││ │
│  │  │    │     ├─► Platform selection (config.startChain.arch)     ││ │
│  │  │    │     ├─► LLM API call                                    ││ │
│  │  │    │     └─► Returns: architecture.md content                ││ │
│  │  │    │                                                          ││ │
│  │  │    └─► TierPlanGenerator.generate(prd)                       ││ │
│  │  │          └─► Returns: TierPlan (phases/tasks/subtasks)       ││ │
│  │  │                                                               ││ │
│  │  │  POST /api/wizard/validate                                   ││ │
│  │  │    └─► ValidationGate.validateAll(prd, arch, plan)           ││ │
│  │  │          ├─► Check PRD schema                                ││ │
│  │  │          ├─► Validate architecture structure                 ││ │
│  │  │          └─► Verify tier plan consistency                    ││ │
│  │  │                                                               ││ │
│  │  │  POST /api/wizard/save                                       ││ │
│  │  │    ├─► Option A: Run StartChainPipeline.execute()            ││ │
│  │  │    │     ├─► Full AI-powered generation                      ││ │
│  │  │    │     ├─► Requirements interview (optional)               ││ │
│  │  │    │     ├─► Multi-pass refinement                           ││ │
│  │  │    │     └─► Save all artifacts                              ││ │
│  │  │    │                                                          ││ │
│  │  │    └─► Option B: Direct save (artifacts pre-generated)       ││ │
│  │  │          ├─► fs.writeFile(prd.json)                          ││ │
│  │  │          ├─► fs.writeFile(architecture.md)                   ││ │
│  │  │          ├─► fs.writeFile(tier-plan.json)                    ││ │
│  │  │          ├─► fs.writeFile(config.yaml)                       ││ │
│  │  │          └─► Create .puppet-master/ structure                ││ │
│  │  └──────────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  routes/index.ts (Orchestrator Control)                          │ │
│  │  ┌──────────────────────────────────────────────────────────────┐│ │
│  │  │  POST /api/start                                              ││ │
│  │  │    └─► Orchestrator.start()                                  ││ │
│  │  │          ├─► Load PRD from disk                              ││ │
│  │  │          ├─► Initialize execution state                      ││ │
│  │  │          ├─► Begin tier execution loop                       ││ │
│  │  │          └─► Emit progress events                            ││ │
│  │  └──────────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CORE BUSINESS LOGIC                               │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  start-chain/        │  │  core/               │                    │
│  │  ├─ prd-generator    │  │  ├─ orchestrator     │                    │
│  │  ├─ arch-generator   │  │  ├─ execution-engine │                    │
│  │  ├─ tier-planner     │  │  ├─ state-machine    │                    │
│  │  ├─ validation-gate  │  │  └─ platform-router  │                    │
│  │  └─ pipeline         │  └──────────────────────┘                    │
│  └──────────────────────┘                                               │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  platforms/          │  │  memory/             │                    │
│  │  ├─ registry         │  │  ├─ prd-manager      │                    │
│  │  ├─ cursor-runner    │  │  ├─ progress-manager │                    │
│  │  ├─ claude-runner    │  │  ├─ agents-manager   │                    │
│  │  ├─ quota-manager    │  │  └─ evidence-store   │                    │
│  │  └─ auth-status      │  └──────────────────────┘                    │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FILE SYSTEM                                     │
│  .puppet-master/                                                        │
│  ├── config.yaml              ← Generated with tier configs             │
│  ├── prd.json                 ← AI-generated PRD                        │
│  ├── architecture.md          ← AI-generated architecture               │
│  ├── plans/                                                             │
│  │   ├── tier-plan.json       ← Generated tier plan                     │
│  │   ├── phase-1-plan.json                                              │
│  │   └── task-1-plan.json                                               │
│  ├── requirements/                                                      │
│  │   └── parsed.json          ← Parsed requirements                     │
│  ├── evidence/                                                          │
│  ├── logs/                                                              │
│  └── usage/                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Rust Architecture (INCOMPLETE)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACE                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  views/wizard.rs                                                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│   │
│  │  │  Upload    │→ │  Generate  │→ │   Review   │→ │   Confirm  ││   │
│  │  │   Reqs     │  │    PRD     │  │    Plan    │  │            ││   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘│   │
│  │        │               │               │               │         │   │
│  │        ▼               ▼               ▼               ▼         │   │
│  │  WizardReqs     WizardGenerate   WizardNextStep  WizardSave     │   │
│  │  Changed(text)   Message         Message          Message       │   │
│  └────────┼──────────────┼──────────────┼──────────────┼──────────┘   │
│           │              │              │              │               │
│           │              │              │              │               │
│  ┌────────┼──────────────┼──────────────┼──────────────┼──────────┐   │
│  │  views/settings.rs                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │  ❌ NO PLATFORM SETUP                                        ││   │
│  │  │  ❌ NO INSTALL UI                                            ││   │
│  │  │  ❌ NO AUTH UI                                               ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  └───────────────────────────────────────────────────────────────────┘ │
│           │              │              │              │               │
└───────────┼──────────────┼──────────────┼──────────────┼───────────────┘
            │              │              │              │
            ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          APP MESSAGE HANDLERS                            │
│  app.rs - update() method                                               │
│                                                                          │
│  Message::WizardRequirementsChanged(text) => {                          │
│      self.wizard_requirements_text = text;  ← ✅ Updates local state    │
│      Task::none()                                                        │
│  }                                                                       │
│                                                                          │
│  Message::WizardGenerate => {                                           │
│      self.add_toast("Generating PRD...");   ← ❌ Just shows toast       │
│      // TODO: Generate PRD via backend      ← ❌ TODO STUB              │
│      Task::none()                                                        │
│  }                                                                       │
│                                                                          │
│  Message::WizardSave => {                                               │
│      self.add_toast("Saved wizard output"); ← ❌ Just shows toast       │
│      // TODO: Save wizard output via backend ← ❌ TODO STUB             │
│      Task::none()                                                        │
│  }                                                                       │
│                                                                          │
│  ❌ NO API CLIENT                                                        │
│  ❌ NO HTTP REQUESTS                                                     │
│  ❌ NO BACKEND INTEGRATION                                               │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ❌ MISSING LAYER                                │
│                                                                          │
│  ❌ No API endpoints                                                     │
│  ❌ No wizard routes                                                     │
│  ❌ No platform routes                                                   │
│  ❌ No file upload handling                                              │
│  ❌ No requirements parsing                                              │
│  ❌ No PRD generation                                                    │
│  ❌ No architecture generation                                           │
│  ❌ No tier plan generation                                              │
│  ❌ No validation                                                        │
│  ❌ No file I/O                                                          │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PARTIAL BUSINESS LOGIC (Disconnected)                  │
│                                                                          │
│  ✅ start_chain/                                                         │
│     ├─ prd_generator.rs      ← Exists but not called from GUI           │
│     ├─ arch_generator.rs     ← Exists but not called from GUI           │
│     └─ validation_gate.rs    ← Exists but not called from GUI           │
│                                                                          │
│  ✅ core/                                                                │
│     ├─ orchestrator.rs       ← Can be started from dashboard            │
│     └─ execution_engine.rs   ← Works if PRD exists                      │
│                                                                          │
│  ❌ No platform install/auth logic                                       │
│  ❌ No wizard pipeline                                                   │
│  ❌ No file save logic for wizard output                                 │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FILE SYSTEM                                     │
│  .puppet-master/                                                        │
│  ├── config.yaml              ← ❌ NOT created by wizard                 │
│  ├── prd.json                 ← ❌ NOT generated by wizard               │
│  ├── architecture.md          ← ❌ NOT generated by wizard               │
│  ├── plans/                   ← ❌ Empty                                 │
│  ├── requirements/            ← ❌ Empty                                 │
│  ├── evidence/                                                          │
│  ├── logs/                                                              │
│  └── usage/                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Side-by-Side Comparison

| Component | TypeScript | Rust |
|-----------|-----------|------|
| **Platform Setup Wizard** | ✅ 763 lines, fully functional | ❌ Does not exist |
| **Requirements Upload** | ✅ File picker + paste, 4 formats | ⚠️ Paste only (UI), no backend |
| **Requirements Parsing** | ✅ Markdown, Text, PDF, DOCX | ❌ Not wired up |
| **PRD Generation** | ✅ AI-powered + fallback | ❌ TODO stub |
| **Architecture Generation** | ✅ AI-powered + fallback | ❌ TODO stub |
| **Tier Plan Generation** | ✅ Full implementation | ❌ Not wired up |
| **Validation** | ✅ Schema + consistency checks | ❌ Not wired up |
| **File Saving** | ✅ Creates all artifacts + config | ❌ TODO stub |
| **API Endpoints** | ✅ 8 endpoints (792 lines) | ❌ None |
| **Platform Install** | ✅ npm/pip automation | ❌ None |
| **Platform Auth** | ✅ OAuth + polling | ❌ None |
| **Start Chain Pipeline** | ✅ Full orchestration | ❌ Not connected |

---

## Data Flow Comparison

### TypeScript: Complete Pipeline

```
User Input
    ↓
React Component
    ↓
API Call (HTTP POST)
    ↓
Express Route Handler
    ↓
Business Logic (PrdGenerator, etc)
    ↓
File System (write artifacts)
    ↓
Success Response
    ↓
UI Update
```

**Every step is implemented and working.**

---

### Rust: Broken Pipeline

```
User Input
    ↓
Iced Widget
    ↓
Message Dispatch
    ↓
app.update() Handler
    ↓
Toast Notification  ← ❌ STOPS HERE
    ↓
❌ NO API CLIENT
❌ NO BUSINESS LOGIC CALL
❌ NO FILE I/O
❌ NO BACKEND
```

**Pipeline ends at message handler with TODO comment.**

---

## The Missing Connector

### What's Needed to Connect Rust GUI to Backend:

#### Option A: HTTP Client to TypeScript API
```rust
// In app.rs

use reqwest;

async fn wizard_generate(&mut self) -> Result<(), Box<dyn Error>> {
    let client = reqwest::Client::new();
    
    // Parse requirements
    let parse_response = client
        .post("http://localhost:3333/api/wizard/upload")
        .json(&json!({
            "text": self.wizard_requirements_text,
            "format": "text"
        }))
        .send()
        .await?
        .json::<ParseResponse>()
        .await?;
    
    // Generate PRD
    let gen_response = client
        .post("http://localhost:3333/api/wizard/generate")
        .json(&json!({
            "parsed": parse_response.parsed,
            "projectName": self.project_name,
            "platform": "cursor",
            "model": "auto"
        }))
        .send()
        .await?
        .json::<GenerateResponse>()
        .await?;
    
    // Update UI
    self.wizard_prd_preview = Some(gen_response.prd);
    self.wizard_architecture = Some(gen_response.architecture);
    self.wizard_tier_plan = Some(gen_response.tier_plan);
    
    Ok(())
}
```

#### Option B: Native Rust Implementation
```rust
// In wizard backend module (new)

pub async fn generate_prd(
    requirements: &str,
    config: &Config,
) -> Result<WizardOutput, Error> {
    // Parse requirements
    let parser = TextParser::new();
    let parsed = parser.parse(requirements)?;
    
    // Generate PRD
    let prd_generator = PrdGenerator::new(config);
    let prd = prd_generator.generate_with_ai(&parsed).await?;
    
    // Generate architecture
    let arch_generator = ArchGenerator::new(config);
    let architecture = arch_generator.generate(&parsed, &prd).await?;
    
    // Generate tier plan
    let tier_planner = TierPlanGenerator::new(config);
    let tier_plan = tier_planner.generate(&prd)?;
    
    Ok(WizardOutput {
        prd,
        architecture,
        tier_plan,
    })
}

pub async fn save_wizard_output(
    output: &WizardOutput,
    project_path: &Path,
) -> Result<(), Error> {
    // Create .puppet-master directory
    let pm_dir = project_path.join(".puppet-master");
    std::fs::create_dir_all(&pm_dir)?;
    
    // Save PRD
    let prd_path = pm_dir.join("prd.json");
    std::fs::write(prd_path, serde_json::to_string_pretty(&output.prd)?)?;
    
    // Save architecture
    let arch_path = pm_dir.join("architecture.md");
    std::fs::write(arch_path, &output.architecture)?;
    
    // Save tier plan
    let plan_path = pm_dir.join("plans").join("tier-plan.json");
    std::fs::create_dir_all(plan_path.parent().unwrap())?;
    std::fs::write(plan_path, serde_json::to_string_pretty(&output.tier_plan)?)?;
    
    // Generate and save config
    let config = generate_default_config(project_path)?;
    let config_path = pm_dir.join("config.yaml");
    std::fs::write(config_path, serde_yaml::to_string(&config)?)?;
    
    Ok(())
}
```

---

## Conclusion

The TypeScript implementation provides a **complete, production-ready wizard** that:
1. Installs and authenticates AI platforms
2. Parses requirements documents
3. Generates PRD via AI
4. Generates architecture via AI
5. Creates tier plans
6. Validates all artifacts
7. Saves everything to disk
8. Integrates with Start Chain Pipeline

The Rust implementation provides a **beautiful but non-functional UI mockup** that:
1. Shows 4 wizard steps
2. Accepts text input
3. Shows toast notifications
4. Does nothing else

**The gap between them is ~2000 lines of backend code.**
