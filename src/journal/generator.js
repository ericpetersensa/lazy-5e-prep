import { STEP_DEFS } from "../steps/index.js";
import { getControlsForStep } from "./controls.js";

/**
 * Generate the journal content from STEP_DEFS
 */
export function generateJournalContent() {
  return STEP_DEFS.map((step, index) => {
    const html = `
      <h2>${step.title}</h2>
      <div class="lazy5e-step">${step.content}</div>
      <div class="lazy5e-control-placeholder" data-step-index="${index}"></div>
    `;
    return html;
  }).join("\n");
}

/**
 * Hook to inject live controls after render
 */
Hooks.on("renderJournalSheet", (sheet, [html]) => {
  html[0].querySelectorAll(".lazy5e-control-placeholder").forEach(placeholder => {
    const stepIndex = parseInt(placeholder.dataset.stepIndex, 10);
    getControlsForStep(stepIndex, placeholder, sheet.document, sheet);
  });
});
