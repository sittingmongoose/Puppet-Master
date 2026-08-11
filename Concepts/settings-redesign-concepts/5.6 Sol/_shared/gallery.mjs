const form = document.querySelector(".review-controls");
const frames = [...document.querySelectorAll("iframe")];
const widthOutput = form.elements.widthOutput;

function reviewState() {
  return {
    theme: form.elements.theme.value,
    scenario: form.elements.scenario.value,
    testWidth: Number(form.elements.width.value),
    viewportWidth: window.innerWidth,
    railOpen: form.elements.rail.checked,
    chatOpen: form.elements.chat.checked,
    reducedMotion: form.elements.reduced.checked
  };
}

function broadcast() {
  const state = reviewState();
  widthOutput.value = `${state.testWidth} px`;
  widthOutput.textContent = `${state.testWidth} px`;
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.reducedMotion = state.reducedMotion ? "1" : "0";
  for (const frame of frames) {
    const stage = frame.closest(".frame-stage");
    const scale = Math.min(1, stage.clientWidth / state.testWidth);
    frame.style.width = `${state.testWidth}px`;
    frame.style.height = `${Math.ceil(stage.clientHeight / scale)}px`;
    frame.style.left = `${Math.max(0, (stage.clientWidth - state.testWidth * scale) / 2)}px`;
    frame.style.transform = `scale(${scale})`;
    frame.contentWindow?.postMessage({ source: "pm-settings-bakeoff", type: "pm-settings-state", state }, "*");
  }
}

form.addEventListener("input", broadcast);
form.addEventListener("change", broadcast);
frames.forEach((frame) => frame.addEventListener("load", broadcast));
window.addEventListener("resize", broadcast);
window.addEventListener("pm-settings-review-state", (event) => {
  const state = event.detail || {};
  if (state.theme) form.elements.theme.value = state.theme;
  if (state.scenario) form.elements.scenario.value = state.scenario;
  if (typeof state.testWidth === "number") form.elements.width.value = state.testWidth;
  if (typeof state.reducedMotion === "boolean") form.elements.reduced.checked = state.reducedMotion;
  if (typeof state.railOpen === "boolean") form.elements.rail.checked = state.railOpen;
  if (typeof state.chatOpen === "boolean") form.elements.chat.checked = state.chatOpen;
  broadcast();
});

async function whenIdle() {
  await Promise.all(frames.map((frame) => frame.contentWindow?.PMSettingsDemo?.whenIdle?.()));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return frames.map((frame) => frame.contentWindow?.PMSettingsDemo?.snapshot?.());
}

window.PMSettingsBakeoff = { broadcast, state: reviewState, frames, whenIdle };
broadcast();
