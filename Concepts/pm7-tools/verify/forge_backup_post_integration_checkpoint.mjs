/* Focused PMConcept7 T46F fast-review checkpoint.
 *
 * This runner checks the generated browser concept before the user's visual
 * review. It is intentionally not the post-approval exhaustive campaign and
 * does not certify native Slint, production handlers, provider access, backup
 * media, security isolation, accessibility conformance, or performance.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function argsOf(argv) {
  const out = {};
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value == null || value.startsWith('--')) {
      throw new Error(`arguments must use bounded --name value pairs; bad token ${key || '<missing>'}`);
    }
    const name = key.slice(2);
    if (Object.hasOwn(out, name)) throw new Error(`duplicate option --${name}`);
    out[name] = value;
  }
  for (const name of ['file', 'out', 'modules', 'chromium']) {
    if (!out[name]) throw new Error(`missing --${name}`);
  }
  return out;
}

const args = argsOf(process.argv);
const artifactPath = resolve(args.file);
const outputPath = resolve(args.out);
const artifactBytes = readFileSync(artifactPath);
const runnerBytes = readFileSync(fileURLToPath(import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const requireFromRuntime = createRequire(resolve(args.modules, 'noop.js'));
const { chromium } = requireFromRuntime('playwright-core');
const targetUrl = args.url || pathToFileURL(artifactPath).href;
mkdirSync(dirname(outputPath), { recursive: true });
const crashDumpPath = resolve(dirname(outputPath), 'crash-dumps');
mkdirSync(crashDumpPath, { recursive: true });

const report = {
  schema_id: 'pm.pmconcept7.forge_backup_post_integration_checkpoint.v1',
  generated_at_utc: new Date().toISOString(),
  disposition: 'fail',
  boundary: {
    scope: 'fast_review_browser_checkpoint_only',
    browser_concept_only: true,
    native_slint_certified: false,
    production_runtime_certified: false,
    provider_or_backup_effects_performed: false,
    exhaustive_post_approval_campaign: false
  },
  artifact: { path: artifactPath, sha256: sha256(artifactBytes), bytes: artifactBytes.length },
  verifier: { path: fileURLToPath(import.meta.url), sha256: sha256(runnerBytes) },
  target_url: targetUrl,
  context: { viewport: { width: 1440, height: 900 }, device_scale_factor: 1, locale: 'en-US', timezone_id: 'UTC', reduced_motion: true },
  checks: [],
  runtime_errors: [],
  ignored_infrastructure_warnings: []
};

function check(id, condition, evidence) {
  report.checks.push({ id, pass: Boolean(condition), evidence: evidence ?? null });
}
function exact(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function containsAll(value, terms) { return terms.every(term => value.includes(term)); }
function containsAllInsensitive(value, terms) { const haystack = value.toLocaleLowerCase('en-US'); return terms.every(term => haystack.includes(term.toLocaleLowerCase('en-US'))); }

let browser = null;

async function makePage(context) {
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    const text = message.text().slice(0, 1000);
    if (/\/favicon\.ico(?:$|\?)/.test(location?.url || '') && /404|failed to load resource/i.test(text)) {
      report.ignored_infrastructure_warnings.push({ kind: 'http_server_favicon_404', text, location });
      return;
    }
    report.runtime_errors.push({ kind: 'console', text, location });
  });
  page.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 1000) }));
  page.on('requestfailed', request => report.runtime_errors.push({ kind: 'requestfailed', url: request.url(), text: request.failure()?.errorText || '' }));
  await page.goto(targetUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.PM7_FORGE_BACKUP_POST_INTEGRATION && window.PM12_KIMI && window.PM7_ONBOARDING_CINEMATIC), null, { timeout: 30000 });
  await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.close('checkpoint'));
  await page.waitForTimeout(80);
  await page.evaluate(async () => {
    if (window.PM_HOVER_TAG_CONTROLLER?.settle) await window.PM_HOVER_TAG_CONTROLLER.settle(document);
  });
  return page;
}

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: resolve(args.chromium),
    args: [
      '--disable-dev-shm-usage',
      '--disable-breakpad',
      '--disable-crash-reporter',
      '--disable-crashpad',
      `--crash-dumps-dir=${crashDumpPath}`,
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });
  const context = await browser.newContext({
    viewport: report.context.viewport,
    deviceScaleFactor: 1,
    locale: report.context.locale,
    timezoneId: report.context.timezone_id,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    acceptDownloads: false
  });
  const page = await makePage(context);

  const identity = await page.evaluate(() => ({
    source_occupants: document.querySelectorAll('[data-ab-id="source"]').length,
    automation_occupants: document.querySelectorAll('[data-ab-id="repository_automation"]').length,
    legacy_primary_occupants: document.querySelectorAll('[data-ab-id="gh-actions"],[data-ab-id="github_actions"]').length,
    source_panel_count: document.querySelectorAll('#panel-source').length,
    automation_panel_count: document.querySelectorAll('#panel-git').length,
    activity_ids: [...document.querySelectorAll('#activityBar [data-ab-id]')].map(node => node.dataset.abId),
    automation_label: document.querySelector('[data-ab-id="repository_automation"] .icon-label')?.textContent.trim(),
    source_help: document.querySelector('[data-ab-id="source"]')?.dataset.pmHoverDetail,
    automation_help: document.querySelector('[data-ab-id="repository_automation"]')?.dataset.pmHoverDetail,
    contract: JSON.parse(document.getElementById('pm7-t46f-contracts').textContent)
  }));
  check('single_source_and_automation_occupants', identity.source_occupants === 1 && identity.automation_occupants === 1 && identity.source_panel_count === 1 && identity.automation_panel_count === 1 && identity.legacy_primary_occupants === 0, identity);
  check('provider_neutral_activity_identity', identity.automation_label === 'PIPELINES' && identity.automation_help?.includes('workflows') && identity.contract.activity_bar_migration.canonical_id === 'repository_automation', identity);
  check('human_source_help', identity.source_help?.includes('safe local history') && !/choose this option/i.test(identity.source_help), identity.source_help);

  await page.locator('[data-ab-id="source"]').click();
  await page.waitForTimeout(650);
  const git = await page.evaluate(() => {
    const panel = document.getElementById('panel-source');
    const rect = panel.getBoundingClientRect();
    return {
      engine: panel.dataset.scmEngine,
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      text: panel.innerText.replace(/\s+/g, ' ').trim(),
      overflow_x: panel.scrollWidth > panel.clientWidth + 1,
      switch_state: [...panel.querySelectorAll('[data-pm7-scm-engine]')].map(node => [node.dataset.pm7ScmEngine, node.getAttribute('aria-pressed')])
    };
  });
  check('git_profile_is_visible_and_engine_correct', git.engine === 'git' && git.rect.width > 0 && containsAllInsensitive(git.text, ['STAGED', 'UNSTAGED', 'Commit', 'Stash changes', 'Publish and review', 'Backup history']) && !git.overflow_x, git);

  await page.locator('#panel-source [data-pm7-scm-engine="jj"]').click();
  await page.waitForTimeout(120);
  const jj = await page.evaluate(() => {
    const panel = document.getElementById('panel-source');
    const visible = node => { const rect = node.getBoundingClientRect(); const style = getComputedStyle(node); return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'; };
    const text = [...panel.querySelectorAll('*')].filter(visible).map(node => node.childElementCount ? '' : node.textContent).join(' ').replace(/\s+/g, ' ').trim();
    return { engine: panel.dataset.scmEngine, text, active_tag: document.activeElement?.dataset.pm7ScmEngine || null, overflow_x: panel.scrollWidth > panel.clientWidth + 1 };
  });
  check('jujutsu_profile_has_no_fake_git_index_or_stash', jj.engine === 'jj' && jj.active_tag === 'jj' && containsAll(jj.text, ['Current Change @', 'Change ID', 'Commit ID', 'New Change', 'Split', 'Squash', 'Operation History', 'Browse backups']) && !/\bSTAGED\b|\bUNSTAGED\b|Stash changes/.test(jj.text) && !jj.overflow_x, jj);

  await page.locator('#panel-source [data-pm7-scm-engine="git"]').click();
  await page.locator('[data-ab-id="repository_automation"]').click();
  await page.waitForTimeout(650);
  const expectedOptions = ['github', 'gitlab', 'azure', 'bitbucket', 'forgejo', 'gitea', 'origin', 'generic'];
  const automation = { options: await page.locator('#pm7AutomationService option').evaluateAll(nodes => nodes.map(node => node.value)), profiles: {} };
  for (const service of expectedOptions) {
    await page.locator('#pm7AutomationService').selectOption(service);
    await page.waitForTimeout(30);
    automation.profiles[service] = await page.locator('#panel-git').textContent();
  }
  const profileRules = {
    github: ['ACTIONS & PIPELINES', 'WORKFLOWS', 'CI — build + test and publish'],
    gitlab: ['GitLab Pipelines', 'Pipeline → stage → job'],
    azure: ['Azure Pipelines', 'Run → stage → job → task'],
    bitbucket: ['Bitbucket Pipelines', 'Pipeline → step'],
    forgejo: ['Forgejo Actions', 'Workflow → job → step'],
    gitea: ['Gitea Actions', 'when supported'],
    origin: ['Connected checks', 'Checks supplied by GitHub'],
    generic: ['No automation service', 'No definitions are fabricated', 'Connect automation']
  };
  const failedProfiles = Object.entries(profileRules).filter(([service, terms]) => !containsAllInsensitive(automation.profiles[service], terms)).map(([service]) => service);
  check('provider_selector_is_exact_and_profiles_are_native', exact(automation.options, expectedOptions) && failedProfiles.length === 0 && !automation.profiles.origin.includes('Origin Actions'), { options: automation.options, failed_profiles: failedProfiles, excerpts: Object.fromEntries(Object.entries(automation.profiles).map(([key, value]) => [key, value.replace(/\s+/g, ' ').slice(0, 500)])) });

  await page.evaluate(async () => {
    if (window.PM_HOVER_TAG_CONTROLLER?.settle) await window.PM_HOVER_TAG_CONTROLLER.settle(document.getElementById('panel-git'));
  });
  const newControlClosure = await page.evaluate(() => {
    const roots = [...document.querySelectorAll('.pm7-scm-context,.pm7-scm-jj-view,.pm7-scm-git-footer,.pm7-automation-context,.pm7-automation-provider-view')];
    const controls = roots.flatMap(root => [...root.querySelectorAll('button,select')]);
    return controls.map(node => ({
      text: (node.getAttribute('aria-label') || node.textContent || '').trim().replace(/\s+/g, ' '),
      command_id: node.dataset.commandId || null,
      ui_action_id: node.dataset.uiActionId || null,
      availability: node.dataset.availability || null,
      disabled_reason: node.dataset.disabledReason || null,
      native_title: node.getAttribute('title')
    }));
  });
  const closureFailures = newControlClosure.filter(row => Number(Boolean(row.command_id)) + Number(Boolean(row.ui_action_id)) !== 1 || !row.availability || row.native_title);
  check('new_controls_have_one_typed_action_and_explicit_availability', newControlClosure.length >= 20 && closureFailures.length === 0, { total: newControlClosure.length, failures: closureFailures });

  await page.locator('#tab-settings').click();
  await page.evaluate(() => window.PM12_KIMI.navigate('system', 'backup'));
  await page.waitForFunction(() => window.PM12_KIMI.getState().workspace === 'backup');
  await page.waitForFunction(() => document.getElementById('workspace-backup')?.getClientRects().length > 0);
  const backupOverview = await page.locator('#workspace-backup').innerText();
  const tabs = await page.locator('#workspace-backup [data-action="backup-tab"]').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
  check('backup_manager_overview_and_tab_census', containsAll(backupOverview, ['Data, Backup & Retention', 'Automatic backups', 'Last complete remote backup', 'Recovery Kit', 'Back up now']) && exact(tabs, ['Overview', 'Destinations', 'Schedules', 'Retention & Cleanup', 'Restore', 'History', 'Recovery & Keys', 'Advanced']), { tabs, excerpt: backupOverview.replace(/\s+/g, ' ').slice(0, 900) });

  await page.locator('#workspace-backup [data-action="backup-tab"][data-tab="destinations"]').click({ force: true });
  await page.waitForTimeout(50);
  const destination = await page.locator('#workspace-backup').innerText();
  const destinationCards = await page.locator('#workspace-backup .pm7-backup-destination').count();
  check('backup_destination_account_and_key_states_are_separate', destinationCards === 2 && containsAll(destination, ['Storage account', 'Decryption key', 'Last complete backup', 'Permissions', 'Bandwidth', 'Encryption domain', 'Cost note']), { destination_cards: destinationCards, excerpt: destination.replace(/\s+/g, ' ').slice(0, 1200) });

  await page.locator('#workspace-backup [data-action="backup-tab"][data-tab="recovery"]').click({ force: true });
  await page.waitForTimeout(50);
  const recovery = await page.locator('#workspace-backup').innerText();
  check('recovery_kit_is_human_protected_and_restore_is_previewed', containsAll(recovery, ['Recovery Kit', 'Human step-up', 'Save Recovery Kit', 'Copy key', 'Test saved kit', 'No activation before approval', 'Open restore preview']), recovery.replace(/\s+/g, ' ').slice(0, 1200));

  await page.locator('#workspace-backup [data-action="backup-tab"][data-tab="advanced"]').click({ force: true });
  await page.waitForTimeout(50);
  const advanced = await page.locator('#workspace-backup').innerText();
  const backupLayout = await page.evaluate(() => {
    const root = document.getElementById('workspace-backup');
    const page = root.querySelector('.manager-page');
    const rect = page.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, viewport: { width: innerWidth, height: innerHeight }, overflow_x: page.scrollWidth > page.clientWidth + 1 };
  });
  check('backup_advanced_routes_to_doctor_without_private_repair', containsAll(advanced, ['Advanced and diagnostics', 'Doctor handoff', 'Open Doctor', 'Human-protected key flow']) && !backupLayout.overflow_x && backupLayout.left >= 0 && backupLayout.right <= backupLayout.viewport.width + 1, { excerpt: advanced.replace(/\s+/g, ' ').slice(0, 900), layout: backupLayout });

  const artifactText = artifactBytes.toString('utf8');
  const onboardingForgeCoverage = {
    forgejo_choice: artifactText.includes("['Forgejo','forgejo','forgejo','A Forgejo server you or your group uses.']"),
    gitea_choice: artifactText.includes("['Gitea','gitea','gitea','A Gitea server you or your group uses.']"),
    provider_labels: artifactText.includes("forgejo:'Forgejo',gitea:'Gitea'"),
    separate_self_hosted_flow: artifactText.includes("if(['forgejo','gitea'].includes(plan.forge))return selfHostedForgeConnectionFields(plan)"),
    instance_address_field: artifactText.includes("planInput(label+' web address','forge_instance_url'")
  };
  check('forgejo_and_gitea_remain_first_class_onboarding_choices', Object.values(onboardingForgeCoverage).every(Boolean), onboardingForgeCoverage);
  const onboardingHelpClosure = {
    shared_visible_target: artifactText.includes('aria-controls="pm7ob-explainer"'),
    active_accessible_description: artifactText.includes("control.setAttribute('aria-describedby','pm7ob-explainer')"),
    obsolete_hidden_per_card_copy_absent: !artifactText.includes('class="pm7ob-explanation" role="note"'),
    self_hosted_fields_top_aligned: artifactText.includes('.pm7ob[data-screen="source"] .pm7ob-source-detail .pm7ob-field { align-self:start; }')
  };
  check('onboarding_explainer_and_self_hosted_field_regression_guard', Object.values(onboardingHelpClosure).every(Boolean), onboardingHelpClosure);
  check('browser_and_native_boundaries_are_truthful', identity.contract.browser_concept_only === true && identity.contract.production_runtime_state === 'unavailable' && identity.contract.native_runtime_state === 'unavailable' && identity.contract.visual_motion_performance_evidence === 'deferred_until_user_approval', identity.contract);

  await context.close();

  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    const migrationContext = await browser.newContext({ viewport: report.context.viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await migrationContext.addInitScript(() => localStorage.setItem('pm.activity_bar_order:v2', JSON.stringify(['source', 'gh-actions', '__more__', 'docker'])));
    const migrationPage = await migrationContext.newPage();
    await migrationPage.goto(targetUrl, { waitUntil: 'load', timeout: 120000 });
    await migrationPage.waitForFunction(() => Boolean(window.PM7_FORGE_BACKUP_POST_INTEGRATION));
    const migrated = await migrationPage.evaluate(() => JSON.parse(localStorage.getItem('pm.activity_bar_order:v2')));
    const migrationEvidence = {
      migrated,
      source_index: migrated.indexOf('source'),
      automation_index: migrated.indexOf('repository_automation'),
      automation_count: migrated.filter(value => value === 'repository_automation').length,
      legacy_ids: migrated.filter(value => ['gh-actions', 'github_actions'].includes(value)),
      retained_more: migrated.includes('__more__'),
      retained_docker: migrated.includes('docker')
    };
    check(
      'legacy_activity_order_is_durably_canonicalized_in_place',
      migrationEvidence.source_index >= 0 &&
        migrationEvidence.automation_index === migrationEvidence.source_index + 1 &&
        migrationEvidence.automation_count === 1 &&
        migrationEvidence.legacy_ids.length === 0 &&
        migrationEvidence.retained_more &&
        migrationEvidence.retained_docker,
      migrationEvidence
    );
    await migrationContext.close();
  } else {
    check('legacy_activity_order_is_durably_canonicalized_in_place', false, { reason: 'HTTP(S) --url required for localStorage migration checkpoint' });
  }
} catch (error) {
  report.runtime_errors.push({ kind: 'runner', text: String(error?.stack || error) });
} finally {
  if (browser) await browser.close();
}

const failed = report.checks.filter(row => !row.pass);
report.summary = { checks: report.checks.length, passed: report.checks.length - failed.length, failed: failed.length, runtime_errors: report.runtime_errors.length };
report.disposition = failed.length === 0 && report.runtime_errors.length === 0 ? 'fast_review_checkpoint_passed' : 'fast_review_findings_present';
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ disposition: report.disposition, report: outputPath, summary: report.summary }, null, 2));
process.exitCode = report.disposition === 'fast_review_checkpoint_passed' ? 0 : 1;
