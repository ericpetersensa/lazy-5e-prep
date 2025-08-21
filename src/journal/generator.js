import { STEP_DEFS } from "../steps/index.js";

const MODULE_ID = "lazy-5e-prep";

/**
 * Find or create the "Session Prep" folder for Journal Entries.
 * @returns {Promise<string|undefined>} The folder ID, or undefined if unavailable.
 */
async function getSessionPrepFolderId() {
  if (getSessionPrepFolderId._cache) return getSessionPrepFolderId._cache;

  let folder = game.folders.find(
    f => f.type === "JournalEntry" && f.name === "Session Prep"
  );

  if (!folder) {
    try {
      folder = await Folder.create({
        name: "Session Prep",
        type: "JournalEntry",
        color: "#85bcde"
      });
    } catch (err) {
      console.error("Error creating 'Session Prep' folder:", err);
      return undefined;
    }
  }

  getSessionPrepFolderId._cache = folder.id;
  return folder.id;
}

export async function createLazy5eJournal(options = {}) {
  const usePages = options.usePages ?? game.settings.get(MODULE_ID, "usePages");
  const journalName = `Lazy 5e Prep — ${new Date().toLocaleDateString()}`;
  const folderId = await getSessionPrepFolderId();

  if (usePages) return createMultiPageJournal(journalName, folderId);
  else return createSinglePageJournal(journalName, folderId);
}

async function createMultiPageJournal(name, folderId) {
  const HTML = CONST.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;

  const pages = STEP_DEFS.map((s, i) => ({
    name: `${i + 1}. ${s.title}`,
    type: "text",
    text: { format: HTML, content: renderStepPlaceholderHTML(s) }
  }));

  return JournalEntry.create({ name, pages, folder: folderId }, { renderSheet: true });
}

async function createSinglePageJournal(name, folderId) {
  const HTML = CONST.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;

  const content = STEP_DEFS.map((s, i) => `
    <h2>${i + 1}. ${s.title}</h2>
    ${renderStepBodyHTML(s)}
    <hr/>
  `).join("\n");

  const pages = [{
    name: game.i18n.localize("LAZY5E.UI.AllStepsPage"),
    type: "text",
    text: { format: HTML, content }
  }];

  return JournalEntry.create({ name, pages, folder: folderId }, { renderSheet: true });
}

function renderStepPlaceholderHTML(step) {
  return `
    ${renderStepHeaderHTML(step)}
    ${renderStepBodyHTML(step)}
  `;
}

function renderStepHeaderHTML(step) {
  return `<h2>${step.title}</h2><p class="notes">${step.description}</p>`;
}

function renderStepBodyHTML(step) {
  const planned = step.planned || [];
  const list = planned.map(p => `<li><strong>${p.label}:</strong> ${p.note}</li>`).join("");

  return `
    <h3>${game.i18n.localize("LAZY5E.UI.PlannedDataSources")}</h3>
    <ul>${list}</ul>
    <h3>${game.i18n.localize("LAZY5E.UI.Notes")}</h3>
    <p>${game.i18n.localize("LAZY5E.UI.NotesPlaceholder")}</p>
  `;
}
