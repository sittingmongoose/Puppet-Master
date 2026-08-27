#!/usr/bin/env bun
/** Exact OMP 18.0.4 provider-filtered catalog discovery helper. */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getSupportedEfforts } from "/home/sittingmongoose/OMP-G3-SOURCE/packages/catalog/src/model-thinking.ts";
import { ModelRegistry } from "/home/sittingmongoose/OMP-G3-SOURCE/packages/coding-agent/src/config/model-registry.ts";
import { discoverAuthStorage } from "/home/sittingmongoose/OMP-G3-SOURCE/packages/coding-agent/src/session/auth-broker-config.ts";
import { AuthStorage } from "/home/sittingmongoose/OMP-G3-SOURCE/packages/coding-agent/src/session/auth-storage.ts";

const PROVIDER = "opencode-go";
const STRATEGY = "online";
const PROFILE = "/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1";
const LOCAL_MODEL_CONFIG_LOADED = false;

type ScopedRegistry = Pick<ModelRegistry, "refreshDiscoverableProviders" | "getAvailableForProviders" | "getError">;

function modelJson(model: ReturnType<ModelRegistry["getAvailableForProviders"]>[number]) {
	return {
		provider: model.provider,
		id: model.id,
		selector: `${model.provider}/${model.id}`,
		name: model.name,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens,
		reasoning: model.reasoning,
		thinking: model.thinking ? getSupportedEfforts(model) : null,
		input: model.input,
		cost: model.cost,
	};
}

async function providerOnlyResult(registry: ScopedRegistry) {
	const providerFilter = new Set([PROVIDER]);
	await registry.refreshDiscoverableProviders(providerFilter, STRATEGY);
	const error = registry.getError();
	if (error) throw error;
	const models = registry.getAvailableForProviders(providerFilter).slice().sort((a, b) => a.id.localeCompare(b.id));
	if (models.some(model => model.provider !== PROVIDER)) throw new Error("provider-filtered result widened");
	return {
		schema_id: "pm.r10.storage_pipeline.omp_provider_only_catalog_result.v1",
		runtime_version: Bun.version,
		provider_filter: [PROVIDER],
		strategy: STRATEGY,
		discovery_invocation_count: 1,
		local_model_config_loaded: LOCAL_MODEL_CONFIG_LOADED,
		extensions_loaded: false,
		online_if_uncached_followup: false,
		models: models.map(modelJson),
	};
}

async function spySelftest() {
	const root = mkdtempSync(join(tmpdir(), "pm-r10-omp-provider-helper-"));
	const auth = await AuthStorage.create(":memory:");
	const calls: string[] = [];
	try {
		const modelsPath = join(root, "models.json");
		const cacheDbPath = join(root, "models.db");
		const sentinel = join(root, "LOCAL_MODEL_CONFIG_SENTINEL");
		const command = `!printf sentinel >> ${JSON.stringify(sentinel)}`;
		writeFileSync(modelsPath, JSON.stringify({ providers: {
			"opencode-go": { baseUrl: "https://go.invalid/v1", api: "openai-completions", auth: "none", discovery: { type: "openai-models-list" } },
			"second-provider": { baseUrl: "https://second.invalid/v1", api: "openai-completions", apiKey: command, headers: { "X-Sentinel": command }, models: [{ id: "sentinel-model" }], discovery: { type: "openai-models-list" } },
		} }));
		await auth.set(PROVIDER, { type: "api_key", key: "spy-key" });
		const registry = new ModelRegistry(auth, modelsPath, { cacheDbPath, ignoreLocalModelConfig: true, fetch: async (input, init) => {
			const url = input instanceof Request ? input.url : String(input);
			calls.push(url);
			const headers = input instanceof Request ? input.headers : new Headers(init?.headers);
			if ([...headers.values()].some(value => value.includes("sentinel"))) throw new Error("local config sentinel reached fetch");
			if (url === "https://catalog.stencil.so/models.json.zstd") return Response.json({});
			if (url === "https://opencode.ai/zen/go/v1/models" && headers.get("Authorization") === "Bearer spy-key") return Response.json({ data: [{ id: "scoped-model" }] });
			throw new Error(`forbidden provider discovery: ${url}`);
		} });
		const result = await providerOnlyResult(registry);
		if (calls.filter(url => url === "https://opencode.ai/zen/go/v1/models").length !== 1 || calls.some(url => !["https://catalog.stencil.so/models.json.zstd", "https://opencode.ai/zen/go/v1/models"].includes(url)) || existsSync(sentinel)) throw new Error("scoped discovery/local config isolation");
		return { schema_id: "pm.r10.storage_pipeline.omp_provider_only_helper_spy.v1", production_result: result, opencode_go_discovery_calls: 1, second_provider_attempts: 0, command_sentinel_absent: true, second_provider_fetch_would_throw: true };
	} finally {
		auth.close();
		rmSync(root, { recursive: true, force: true });
	}
}

async function main() {
	const args = process.argv.slice(2);
	if (Bun.version !== "1.4.0") throw new Error("provider helper Bun runtime mismatch");
	if (args.length === 1 && args[0] === "--selftest-spy") {
		process.stdout.write(`${JSON.stringify(await spySelftest())}\n`);
		return;
	}
	if (args.length !== 0) throw new Error("provider helper accepts no production arguments");
	if (Bun.env.BUN_BE_BUN !== "1" || Bun.env.PI_CODING_AGENT_DIR !== PROFILE) throw new Error("provider helper runtime/profile mismatch");
	const auth = await discoverAuthStorage(PROFILE);
	try {
		const registry = new ModelRegistry(auth, join(PROFILE, "models.yml"), { cacheDbPath: join(PROFILE, "models.db"), ignoreLocalModelConfig: true });
		process.stdout.write(`${JSON.stringify(await providerOnlyResult(registry))}\n`);
	} finally {
		auth.close();
	}
}

main().catch(error => {
	process.stderr.write(`${error instanceof Error ? error.name : "Error"}: ${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
