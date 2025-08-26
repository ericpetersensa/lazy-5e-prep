// controls.js — registry-driven interactive controls for lazy-5e-prep
const controlRegistry = {};

/**
 * Register a control builder function for a given step number.
 * @param {number} stepIndex
 * @param {(containerEl: HTMLElement, journalEntry: JournalEntry, sheet: JournalSheet) => void} builder
 */
export function registerStepControls(stepIndex, builder) {
  controlRegistry[stepIndex] = builder;
}

/**
 * Retrieve and render controls for a specific step index
 */
export function getControlsForStep(stepIndex, containerEl, journalEntry, sheet) {
  const builder = controlRegistry[stepIndex];
  if (typeof builder === "function") {
    builder(containerEl, journalEntry, sheet);
  }
}

// ----------------------
// Example: Step 0 Tracker
// ----------------------
registerStepControls(0, (container, journal, sheet) => {
  container.classList.add("lazy5e-controls");

  const lastSeenRow = document.createElement("div");
  lastSeenRow.classList.add("lazy5e-row");
  const lastSeenLabel = document.createElement("label");
  lastSeenLabel.textContent = "Last Seen:";
  const lastSeenInput = document.createElement("input");
  lastSeenInput.type = "date";

  lastSeenInput.addEventListener("change", () => {
    journal.setFlag("lazy-5e-prep", "lastSeen", lastSeenInput.value);
  });

  lastSeenRow.append(lastSeenLabel, lastSeenInput);
  container.appendChild(lastSeenRow);

  const lastSpotRow = document.createElement("div");
  lastSpotRow.classList.add("lazy5e-row");
  const lastSpotLabel = document.createElement("label");
  lastSpotLabel.textContent = "Last Spotlight:";
  const lastSpotInput = document.createElement("input");
  lastSpotInput.type = "date";

  lastSpotInput.addEventListener("change", () => {
    journal.setFlag("lazy-5e-prep", "lastSpotlight", lastSpotInput.value);
  });

  lastSpotRow.append(lastSpotLabel, lastSpotInput);
  container.appendChild(lastSpotRow);

  // Load saved values
  lastSeenInput.value = journal.getFlag("lazy-5e-prep", "lastSeen") ?? "";
  lastSpotInput.value = journal.getFlag("lazy-5e-prep", "lastSpotlight") ?? "";
});
