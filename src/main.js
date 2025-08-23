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

  // Setting to choose Pages vs. single Journal
  game.settings.register(MODULE_ID, "usePages", {
    name: "Use Pages instead of Journal Entries",
    hint: "If enabled, prep steps will be created as individual Pages in a Journal. If disabled, all steps are combined into one Page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Settings menu for manual trigger
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

/* ---------------------------------
   GM‑only Journal Directory Button — v13 Safe
----------------------------------- */
Hooks.on("renderJournalDirectory", (app, element) => {
  if (!game.user.isGM) return;

  // Wrap raw HTMLElement into jQuery object
  const html = element instanceof jQuery ? element : $(element);

  // Prevent duplicate injection
  if (html.find(".generate-lazy-prep").length) return;

  const button = $(`
    <button type="button" class="generate-lazy-prep">
      <i class="fas fa-book-open"></i> Generate Lazy DM Prep
    </button>
  `);

  button.on("click", async () => {
    const usePages = game.settings.get(MODULE_ID, "usePages");
    ui.notifications.info("Generating Lazy DM Prep journal…");
    await createLazy5eJournal({ usePages });
    ui.notifications.info("Lazy DM Prep journal created!");
  });

  // v13 toolbar selector
  const header = html.find(".directory-header .action-buttons");
  if (header.length) {
    header.append(button);
  } else {
    console.warn(`${MODULE_ID} | Could not find Journal Directory header container`);
  }
});

/* ---------------------------------
   GM‑only /prep Chat Command
----------------------------------- */
Hooks.on("chatMessage", (chatLog, messageText) => {
  if (messageText.trim().toLowerCase() === "/prep") {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can generate the Lazy DM Prep journal.");
      return false;
    }
    const usePages = game.settings.get(MODULE_ID, "usePages");
    createLazy5eJournal({ usePages });
    return false; // Suppress output in chat
  }
});
