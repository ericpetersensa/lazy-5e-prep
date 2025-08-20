import { registerSettings, openSettingsMenu } from "./settings.js";
import { createLazy5eJournal } from "./journal/generator.js";

Hooks.once("init", () => {
  console.log("Lazy 5e Prep | init hook firing");
  console.debug("lazy-5e-prep | init");
  registerSettings();
});

Hooks.once("ready", async () => {
  console.debug("lazy-5e-prep | ready");
});

globalThis.Lazy5ePrep = {
  createJournal: createLazy5eJournal,
  openSettings: openSettingsMenu
};
