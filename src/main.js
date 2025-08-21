const MODULE_ID = "lazy-5e-prep";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing ${MODULE_ID}`);

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
    hint: "Click to create a Lazy 5e DM prep journal or pages.",
    icon: "fas fa-book",
    type: GeneratePrepForm,
    restricted: true
  });
});

class GeneratePrepForm extends FormApplication {
  async _updateObject() {
    await generatePrepJournal();
  }
}

async function generatePrepJournal() {
  const usePages = game.settings.get(MODULE_ID, "usePages");

  const stepTemplates = [
    { name: "1. Review the Characters", content: "<p>Summarize each character...</p>" },
    { name: "2. Strong Start", content: "<p>Describe an opening scene...</p>" },
    { name: "3. Scenes", content: "<p>List key scenes...</p>" },
    { name: "4. Secrets & Clues", content: "<p>Write 10 short secrets...</p>" },
    { name: "5. Fantastic Locations", content: "<p>Describe evocative locations...</p>" },
    { name: "6. Important NPCs", content: "<p>List major NPCs...</p>" },
    { name: "7. Monsters", content: "<p>List notable monsters...</p>" },
    { name: "8. Treasure", content: "<p>Outline rewards...</p>" },
    { name: "Notes", content: "<p>Additional prep notes...</p>" }
  ];

  // Sanity check: ensure no nulls
  for (const step of stepTemplates) {
    if (!step.name || !step.content) {
      console.error(`Invalid step detected:`, step);
      ui.notifications.error(`Invalid step data — check console`);
      return;
    }
  }

  try {
    if (usePages) {
      const journal = await JournalEntry.create({
        name: "Lazy DM Prep",
        pages: stepTemplates.map(t => ({
          name: t.name,
          type: "text",
          text: {
            content: t.content,
            format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          }
        }))
      });
      ui.notifications.info(`Created prep journal with ${stepTemplates.length} pages.`);
      journal.sheet.render(true);
    } else {
      const combined = stepTemplates
        .map(t => `<h2>${t.name}</h2>${t.content}`)
        .join("<hr>");
      const journal = await JournalEntry.create({
        name: "Lazy DM Prep",
        pages: [{
          name: "Session Prep",
          type: "text",
          text: {
            content: combined,
            format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          }
        }]
      });
      ui.notifications.info("Created single prep journal (with all steps + notes).");
      journal.sheet.render(true);
    }
  } catch (err) {
    console.error(`${MODULE_ID} | Error creating journal:`, err);
    ui.notifications.error("Failed to create prep journal — see console.");
  }
}

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});
