Hooks.once("init", () => {
  // ✅ 1. Register a real setting so Foundry shows our module heading
  game.settings.register("lazy-5e-prep", "usePages", {
    name: "Use Pages instead of Journal Entries",
    hint: "If enabled, prep steps will be created as individual Pages in a Journal. Otherwise all steps go into one Page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
});

Hooks.on("renderSettingsConfig", (app, html) => {
  // Only modify our own module section
  const moduleHeader = html.find(`h2.module-name[data-module-name="lazy-5e-prep"]`);
  if (!moduleHeader.length) return;

  // Create the Generate button
  const generateBtn = $(
    `<button type="button" style="margin-top:0.5em;">
      <i class="fas fa-dice-d20"></i> Generate Prep Journal
    </button>`
  );

  // Attach click event to call your generator
  generateBtn.on("click", async () => {
    try {
      await createLazy5eJournal(); // from generator.js
      ui.notifications.info("Lazy 5e Prep Journal created successfully.");
    } catch (err) {
      console.error(err);
      ui.notifications.error("Failed to create Lazy 5e Prep Journal.");
    }
  });

  // Insert button after the heading
  moduleHeader.after(generateBtn);
});
