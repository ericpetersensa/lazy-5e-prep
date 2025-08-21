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
