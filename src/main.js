// src/main.js
import { createLazy5eJournal } from "./journal/generator.js";

Hooks.once("init", () => {
  console.log("Lazy 5e Prep | Initializing module");
});

Hooks.once("ready", () => {
  console.log("Lazy 5e Prep | Module is ready");
});

/**
 * Add a button to the Game Settings menu
 * that runs the createLazy5eJournal process
 */
Hooks.on("renderSettingsConfig", (app, html) => {
  const generateBtn = $(
    `<button type="button" class="lazy-5e-generate">
       <i class="fas fa-book"></i> Generate Session Prep
     </button>`
  );

  generateBtn.on("click", async () => {
    try {
      ui.notifications.info("Generating Session Prep journal...");
      await createLazy5eJournal();
      ui.notifications.info("Session Prep journal created successfully!");
    } catch (err) {
      console.error("Lazy 5e Prep | Error generating journal:", err);
      ui.notifications.error("Error generating Session Prep journal — check console.");
    }
  });

  // Append to the bottom of the settings tab
  html.find(".form-group:last").after(generateBtn);
});
