const MODULE_ID = "lazy-5e-prep";

Hooks.once("init", async function () {
  console.log(`${MODULE_ID} | Initializing ${MODULE_ID}`);

  // Register settings
  game.settings.register(MODULE_ID, "usePages", {
    name: "Use Pages instead of Journal Entries",
    hint: "If enabled, prep steps will be created as individual Pages in a Journal. If disabled, all steps are combined into a single Journal Entry as one Page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Add button to trigger prep generation
  game.settings.registerMenu(MODULE_ID, "generatePrep", {
    name: "Generate Prep Journal",
    label: "Generate",
    hint: "Click to create a Lazy 5e DM prep journal or pages.",
    icon: "fas fa-book",
    type: GeneratePrepForm,
    restricted: true
  });
});

// Simple form that runs our generation logic on submit
class GeneratePrepForm extends FormApplication {
  async _updateObject(event, formData) {
    await generatePrepJournal();
  }
}

// Core generation logic
async function generatePrepJournal() {
  const usePages = game.settings.get(MODULE_ID, "usePages");

  // 8 Lazy DM steps + Notes
  const stepTemplates = [
    { name: "1. Review the Characters", content: "<p>Summarize each character: name, class, level, goals, flags, bonds, and current resources. Note hooks you can pull.</p>" },
    { name: "2. Strong Start", content: "<p>Describe an opening scene or encounter to immediately engage the players.</p>" },
    { name: "3. Scenes", content: "<p>List key scenes, events, or challenges for this session. Aim for 3–5 flexible beats.</p>" },
    { name: "4. Secrets & Clues", content: "<p>Write 10 short secrets, revelations, or clues the characters might discover—regardless of how.</p>" },
    { name: "5. Fantastic Locations", content: "<p>Describe evocative locations (sights, sounds, sensations). Add 2–3 interactive details per location.</p>" },
    { name: "6. Important NPCs", content: "<p>List major NPCs with a few descriptive traits, goals, and a voice or mannerism.</p>" },
    { name: "7. Monsters", content: "<p>List notable monsters or foes, their motivations, and how they telegraph danger.</p>" },
    { name: "8. Treasure", content: "<p>Outline rewards, loot, or incentives (story rewards, consumables, gold, magic items).</p>" },
    { name: "Notes", content: "<p>Additional prep notes, rules reminders, contingencies, or follow-up items.</p>" }
  ];

  if (usePages) {
    // One Journal Entry with multiple Pages
    const journal = await JournalEntry.create({
      name: "Lazy DM Prep",
      pages: stepTemplates.map(t => ({
        name: t.name,
        type: "text",
        text: { content: t.content, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML }
      }))
    });

    ui.notifications.info(`Created prep journal with ${stepTemplates.length} pages.`);
    journal.sheet.render(true);
  } else {
    // One Journal Entry with a single Page combining all steps
    const combined = stepTemplates
      .map(t => `<h2>${t.name}</h2>${t.content}`)
      .join("<hr>");

    const journal = await JournalEntry.create({
      name: "Lazy DM Prep",
      pages: [{
        name: "Session Prep",
        type: "text",
        text: { content: combined, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML }
      }]
    });

    ui.notifications.info("Created single prep journal (one page with all steps + notes).");
    journal.sheet.render(true);
  }
}

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});
