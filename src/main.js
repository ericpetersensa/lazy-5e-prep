import { createLazy5eJournal } from "./journal/generator.js";

const MODULE_ID = "lazy-5e-prep";

class InstantGenerateForm extends FormApplication {
  async render(...args) {
    try {
      const usePages = game.settings.get(MODULE_ID, "usePages");
      const journal = await createLazy5eJournal({ usePages });

      if (journal) {
        ui.notifications.info("Lazy DM Prep journal created.");
        journal.sheet.render(true);
      } else {
        ui.notifications.warn("Journal creation failed — check console for details.");
      }
    } catch (err) {
      console.error(`${MODULE_ID} | Error generating journal:`, err);
      ui.notifications.error("Failed to create prep journal.");
    }
    return this.close();
  }
}

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);

  game.settings.register(MODULE_ID, "usePages", {
    name: "Use Pages instead of Journal Entries",
    hint: "If enabled, prep steps will be created as individual Pages in a Journal. If disabled, all steps are combined into one Page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.registerMenu(MODULE_ID, "generatePrep", {
    name: "Generate Prep Journal",
    label: "Generate",
    hint: "Click to immediately create a Lazy DM Prep journal or pages.",
    icon: "fas fa-book",
    type: InstantGenerateForm,
    restricted: true
  });
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});
