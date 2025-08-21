Hooks.once("init", () => {
  // 1. Register a real setting so Foundry creates our section in Configure Settings
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
  // 2. v13 markup uses .package-title with data-package-id
  const moduleHeader = html.find(`.package-title[data-package-id="lazy-5e-prep"]`);
  if (!moduleHeader.length) return;

  // 3. Create the Generate button
  const generateBtn = $(`
    <button type="button" class="generate-prep-btn">
      <i class="fas fa-dice-d20"></i> Generate Prep Journal
    </button>
  `).css({
    marginTop: "0.5em",
    display: "block"
  });

  // 4. Hook up click handler to your generator
  generateBtn.on("click", async () => {
    try {
      await createLazy5eJournal(); // assumes it's globally available from generator.js
      ui.notifications.info("Lazy 5e Prep Journal created successfully.");
    } catch (err) {
      console.error(err);
      ui.notifications.error("Failed to create Lazy 5e Prep Journal.");
    }
  });

  // 5. Insert right below the module title
  moduleHeader.after(generateBtn);
});
