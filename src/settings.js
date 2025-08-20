import { createLazy5eJournal } from "./journal/generator.js";

const MODULE_ID = "lazy-5e-prep";

export function registerSettings() {
  game.settings.registerMenu(MODULE_ID, "settingsMenu", {
    name: game.i18n.localize("LAZY5E.SETTINGS.MenuName"),
    label: game.i18n.localize("LAZY5E.SETTINGS.MenuLabel"),
    hint: game.i18n.localize("LAZY5E.SETTINGS.MenuHint"),
    type: Lazy5eSettingsForm,
    restricted: true
  });

  game.settings.register(MODULE_ID, "usePages", {
    name: game.i18n.localize("LAZY5E.SETTINGS.UsePagesName"),
    hint: game.i18n.localize("LAZY5E.SETTINGS.UsePagesHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

export function openSettingsMenu() {
  new Lazy5eSettingsForm().render(true);
}

class Lazy5eSettingsForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "lazy-5e-prep-settings",
      title: game.i18n.localize("LAZY5E.SETTINGS.DialogTitle"),
      template: null,
      classes: ["lazy-5e-prep", "form"],
      width: 420,
      closeOnSubmit: false
    });
  }

  async render(force, options = {}) {
    const html = await super.render(force, options);
    const container = document.querySelector(`#${this.id}`);
    if (!container) return html;

    container.innerHTML = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("LAZY5E.SETTINGS.UsePagesName")}</label>
          <input type="checkbox" name="usePages" ${game.settings.get(MODULE_ID, "usePages") ? "checked" : ""}/>
          <p class="notes">${game.i18n.localize("LAZY5E.SETTINGS.UsePagesHint")}</p>
        </div>

        <footer class="sheet-footer flexrow">
          <button type="button" name="generate" class="lazy-5e-generate">
            <i class="fas fa-book"></i> ${game.i18n.localize("LAZY5E.UI.GenerateJournal")}
          </button>
          <button type="button" name="save" class="lazy-5e-save">
            <i class="fas fa-save"></i> ${game.i18n.localize("LAZY5E.UI.SaveSettings")}
          </button>
        </footer>
      </form>
    `;

    container.querySelector(".lazy-5e-generate")?.addEventListener("click", async () => {
      const usePages = container.querySelector('input[name="usePages"]').checked;
      await game.settings.set(MODULE_ID, "usePages", usePages);
      await createLazy5eJournal({ usePages });
      ui.notifications.info(game.i18n.localize("LAZY5E.UI.JournalCreated"));
    });

    container.querySelector(".lazy-5e-save")?.addEventListener("click", async () => {
      const usePages = container.querySelector('input[name="usePages"]').checked;
      await game.settings.set(MODULE_ID, "usePages", usePages);
      ui.notifications.info(game.i18n.localize("LAZY5E.UI.SettingsSaved"));
    });

    return html;
  }
}
