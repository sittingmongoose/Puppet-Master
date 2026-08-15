import { escapeHtml } from "./definitions.js";

export function activeThread(data, ui) {
  return data.threadMap[ui.activeThreadId] ?? ui.spawnedThreads?.find((thread) => thread.id === ui.activeThreadId) ?? data.threads[0];
}

export function threadMessages(data, ui, threadId = ui.activeThreadId) {
  return [...(data.threadMap[threadId]?.messages ?? []), ...(ui.addedMessages[threadId] ?? [])];
}

export function visibleMessages(data, ui, limit = 24) {
  const messages = threadMessages(data, ui);
  if (messages.length <= limit) return messages;
  const selectedIndex = messages.findIndex((message) => message.id === ui.search.selectedResult);
  if (selectedIndex >= 0) {
    const start = Math.max(0, Math.min(messages.length - limit, selectedIndex - Math.floor(limit / 2)));
    return messages.slice(start, start + limit);
  }
  return messages.slice(-limit);
}

export function threadShells(data, ui) {
  const spawned = ui.spawnedThreads ?? [];
  return [...data.threads, ...spawned].map((thread) => ({
    id: thread.id,
    title: ui.threadMeta[thread.id]?.title ?? thread.title,
    project: thread.project,
    pinned: ui.threadMeta[thread.id]?.pinned ?? thread.pinned,
    archived: ui.threadMeta[thread.id]?.archived ?? thread.archived,
    state: ui.threadMeta[thread.id]?.threadState ?? thread.threadState,
    updatedAt: thread.updatedAt,
    messageCount: (thread.messages?.length ?? 0) + (ui.addedMessages[thread.id]?.length ?? 0),
    hasDraft: Boolean(ui.threadViews[thread.id]?.draft),
    active: thread.id === ui.activeThreadId
  }));
}

export function activeQuestionnaire(ui) {
  return ui.question.queue.find((questionnaire) => questionnaire.id === ui.question.activeId) ?? ui.question.queue[0] ?? null;
}

export function activeQuestion(ui) {
  const questionnaire = activeQuestionnaire(ui);
  return questionnaire?.questions?.[questionnaire.activeIndex ?? 0] ?? null;
}

export function selectedArtifact(data, ui) {
  return data.extension.artifacts.find((artifact) => artifact.id === ui.artifact.selectedId) ?? data.extension.artifacts[0];
}

export function routeModel(data, ui) {
  for (const provider of data.extension.route_catalog) {
    for (const account of provider.accounts) {
      const model = account.models.find((item) => item.id === ui.route.modelId);
      if (model) return { provider, account, model };
    }
  }
  return null;
}

export function searchResults(data, ui) {
  const query = ui.search.query.trim().toLocaleLowerCase();
  if (!query) return [];
  const threadIds = ui.search.scope === "Current Thread" ? [ui.activeThreadId] : data.threads.map((thread) => thread.id);
  const results = [];
  for (const threadId of threadIds) {
    const thread = data.threadMap[threadId];
    for (const message of threadMessages(data, ui, threadId)) {
      const body = String(message.body ?? "");
      const index = body.toLocaleLowerCase().indexOf(query);
      if (index === -1) continue;
      results.push({
        threadId,
        threadTitle: thread?.title ?? threadId,
        messageId: message.id,
        role: message.role,
        excerpt: `${index > 42 ? "…" : ""}${body.slice(Math.max(0, index - 42), index + query.length + 74)}${index + query.length + 74 < body.length ? "…" : ""}`
      });
      if (results.length >= 24) return results;
    }
  }
  return results;
}

export function highlightedExcerpt(result, query) {
  const escaped = escapeHtml(result.excerpt);
  if (!query.trim()) return escaped;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return escaped.replace(pattern, "<mark>$1</mark>");
}

export function workModel(data, ui) {
  return {
    goal: ui.operational.goal,
    todos: ui.operational.todos,
    subagents: ui.operational.subagents,
    crew: ui.operational.crew,
    activity: ui.operational.activity,
    diff: ui.operational.diff,
    resources: ui.operational.resources,
    usage: ui.operational.usage,
    phase: ui.activityPhase,
    active: ui.agentActive,
    workingSummary: ui.workingSummary,
    workedSeconds: ui.workedSeconds,
    expanded: ui.threadViews[ui.activeThreadId]?.workExpanded ?? {},
    resourceSelection: ui.resourceSelection
  };
}

export function stateTone(state) {
  const normalized = String(state ?? "").toLocaleLowerCase();
  if (/complete|ready|live|resolved|sent|updated|silent/.test(normalized)) return "positive";
  if (/blocked|error|failed|unsupported|conflict|stopped|cancel/.test(normalized)) return "negative";
  if (/waiting|queued|paused|offline|cooling|unknown|pending|cached/.test(normalized)) return "warning";
  if (/running|active|evaluating|synchronizing|replay|loading|replanning/.test(normalized)) return "active";
  return "neutral";
}
