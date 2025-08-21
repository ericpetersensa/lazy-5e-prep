// src/main.js
const MODULE_ID = "lazy-5e-prep";

/**
 * Register module settings and menus.
 */
function registerSettings() {
  console.log(`${MODULE_ID} | registerSettings() called`);

  try {
    // Settings Menu Registration
    game.settings.registerMenu(MODULE_ID, "settingsMenu", {
      name: "Lazy 5e Prep",
      label: "Open",
      hint: "Configure Lazy 5e Prep options.",
      icon: "fas fa-dice-d20",
      type: Lazy5ePrepSettingsForm, // Replace with your actual FormApplication class
      restricted: false
    });
    console.log(`${MODULE_ID} | settingsMenu registered`);

    // Example Boolean Setting
    game.settings.register(MODULE_ID, "usePages", {
      name: "Create separate pages per step",
      hint: "If enabled, each step will be on its own page.",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });
    console.log(`${MODULE_ID} | usePages setting registered`);

  } catch (err) {
    console.error(`${MODULE_ID} | Error in registerSettings:`, err);
  }
}

/**
 * Initialization hook.
 */
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | init hook running`);
  registerSettings();
});

/**
 * Ready hook — verify registry contents.
 */
Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | ready hook running`);

  const keys = Array.from(game.settings.settings.keys())
    .filter(k => k.startsWith(MODULE_ID));

  console.log(`${MODULE_ID} | Registered settings keys:`, keys);

  if (keys.length === 0) {
    console.warn(`${MODULE_ID} | No settings registered — check if registerSettings() ran and no errors occurred`);
  } else {
    console.info(`${MODULE_ID} | Settings successfully registered`);
  }
});

/**
 * Dummy class for settings form — replace with your actual FormApplication logic.
 */
class Lazy5ePrepSettingsForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "Lazy 5e Prep Settings",
      id: "lazy-5e-prep-settings",
      template: `modules/${MODULE_ID}/templates/settings.html`,
      width: 400
    });
  }

  getData(options) {
    return {
      usePages: game.settings.get(MODULE_ID, "usePages")
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  async _updateObject(event, formData) {
    await game.settings.set(MODULE_ID, "usePages", formData.usePages);
  }
}
