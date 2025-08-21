import { createLazy5eJournal } from "./journal/generator.js";

const MODULE_ID = "lazy-5e-prep";

Hooks.once("init", () => {
  // Register setting so our module section exists in Configure Settings
  game.settings.register(MODULE_ID, "usePages", {
    name: "Use Pages instead of Journal Entries",
    hint: "If enabled, prep steps will be created as individual Pages in a Journal. Otherwise all steps go into one Page.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
});

Hooks.on("renderSettingsConfig", (app, html) => {
  // Find the row for our usePages setting
  const settingRow = html.find(`.form-group:has(input[name="${MODULE_ID}.usePages"])`);
  if (!settingRow.length) {
    console.warn("Lazy 5e Prep | Could not find usePages row in settings config.");
    return;
  }

  // Create the Generate button
  const generateBtn = $(`
    <button type="button" class="generate-prep-btn">
      <i class="fas fa-dice-d20"></i> Generate Prep Journal
    </button>
  `).css({
    marginTop: "0.5em",
    display: "block"
  });

  // Wire click to generator
  generateBtn.on("click", async () => {
    try {
      await createLazy5eJournal();
      ui.notifications.info("Lazy 5e Prep Journal created successfully.");
    } catch (err) {
      console.error("Lazy 5e Prep | Error generating journal:", err);
      ui.notifications.error("Failed to create Lazy 5e Prep Journal.");
    }
  });

  // Insert after our setting row
  settingRow.after($("<div>").append(generateBtn));
});
