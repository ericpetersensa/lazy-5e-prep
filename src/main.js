// src/main.js
const MODULE_ID = "lazy-5e-prep";

/**
 * Register module settings and menus.
 */
function registerSettings() {
  game.settings.registerMenu(MODULE_ID, "settingsMenu", {
    name: "Lazy 5e Prep",
    label: "Open",
    hint: "Configure Lazy 5e Prep options.",
    icon: "fas fa-dice-d20",
    type: Lazy5ePrepSettingsForm,
    restricted: false
  });

  game.settings.register(MODULE_ID, "usePages", {
    name: "Create separate pages per step",
    hint: "If enabled, each step will be on its own page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}

/**
 * Initialization hook.
 */
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);
  registerSettings();
});

/**
 * Ready hook — runtime branch reacting to usePages value.
 */
Hooks.once("ready", () => {
  const usePages = game.settings.get(MODULE_ID, "usePages");

  if (usePages) {
    ui.notifications.info("Lazy 5e Prep: Pages mode is ON — each step will be a separate Journal page.");
  } else {
    ui.notifications.info("Lazy 5e Prep: Pages mode is OFF — all steps will be in a single Journal page.");
  }
});

/**
 * Example function that uses the runtime branch to create journals.
 */
async function generatePrepJournal() {
  const usePages = game.settings.get(MODULE_ID, "usePages");

  if (usePages) {
    // Multiple pages — one per step
    await JournalEntry.create({
      name: `Session Prep – ${new Date().toLocaleDateString()}`,
      pages: [
        { name: "Strong Start", type: "text", text: { content: "<p>Your strong start here...</p>" } },
        { name: "Secrets & Clues", type: "text", text: { content: "<p>Your secrets and clues here...</p>" } },
        { name: "Fantastic Locations", type: "text", text: { content: "<p>Your locations here...</p>" } },
        { name: "NPCs", type: "text", text: { content: "<p>Your NPCs here...</p>" } }
        // Add more steps as desired
      ]
    });
  } else {
    // Single page — all steps together
    const allStepsContent = `
      <h2>Strong Start</h2><p>Your strong start here...</p>
      <h2>Secrets & Clues</h2><p>Your secrets and clues here...</p>
      <h2>Fantastic Locations</h2><p>Your locations here...</p>
      <h2>NPCs</h2><p>Your NPCs here...</p>
    `;

    await JournalEntry.create({
      name: `Session Prep – ${new Date().toLocaleDateString()}`,
      content: allStepsContent
    });
  }
}

/**
 * Settings form class.
 */
class Lazy5ePrepSettingsForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "Lazy 5e Prep Settings",
      id: "lazy-5e-prep-settings",
      template: `modules/${MODULE_ID}/templates/settings.html`,
      width: 500
    });
  }

  /** Pass data to the template */
  getData() {
    return {
      usePages: game.settings.get(MODULE_ID, "usePages")
    };
  }

  /** Update settings when the form is submitted */
  async _updateObject(event, formData) {
    await game.settings.set(MODULE_ID, "usePages", formData.usePages);
    ui.notifications.info("Lazy 5e Prep settings updated.");
  }
}

// Optionally expose the generate function globally for quick console testing
globalThis.Lazy5ePrep = { generatePrepJournal };
