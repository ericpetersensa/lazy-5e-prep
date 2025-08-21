import { registerSettings, openSettingsMenu } from "./settings.js";
import { createLazy5eJournal } from "./journal/generator.js";

// Fires once when Foundry initializes modules — register settings here
Hooks.once("init", () => {
  console.log("Lazy 5e Prep | init hook firing");
  registerSettings();
});

// Fires once after everything is ready — good place for debug checks
Hooks.once("ready", async () => {
  console.debug("lazy-5e-prep | ready");

  // TEMP: verify our settings are registered with Foundry
  console.log(
    "Settings registered for lazy-5e-prep:",
    Array.from(game.settings.settings.keys()).filter(k => k.startsWith("lazy-5e-prep"))
  );
});

// Expose handy functions globally for console/testing
globalThis.Lazy5ePrep = {
  createJournal: createLazy5eJournal,
  openSettings: openSettingsMenu
};
