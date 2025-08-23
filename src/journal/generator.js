import { STEP_DEFS } from "../steps/index.js";

const MODULE_ID = "lazy-5e-prep";

export async function createLazy5eJournal(options = {}) {
  const usePages = options.usePages ?? game.settings.get(MODULE_ID, "usePages");
  const journalName = `Lazy 5e Prep — ${new Date().toLocaleDateString()}`;
  const folder = await getOrCreateLazyPrepFolder();

  if (!folder) {
    ui.notifications.warn("Could not create or locate folder for Lazy 5e Prep.");
    return null;
  }

  if (usePages) return createMultiPageJournal(journalName, folder);
  else return createSinglePageJournal(journalName, folder);
}

async function createMultiPageJournal(name, folder) {
  const HTML = CONST.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;

  const pages = STEP_DEFS.map((s, i) => ({
    name: `${i + 1}. ${s.title}`,
    type: "text",
    text: { format: HTML, content: renderStepPlaceholderHTML(s) }
  }));

  return JournalEntry.create({
    name,
    folder: folder.id,
    pages
  }, { renderSheet: true });
}

async function createSinglePageJournal(name, folder) {
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

  return JournalEntry.create({
    name,
    folder: folder.id,
    pages
  }, { renderSheet: true });
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

// 📁 Folder creation helper — returns full Folder object
async function getOrCreateLazyPrepFolder() {
  const folderName = "Lazy 5e Prep";
  const folderType = "JournalEntry";
  const folderColor = "#85bcde";

  let folder = game.folders.find(f => f.name === folderName && f.type === folderType);
  if (folder) return folder;

  try {
    folder = await Folder.create({
      name: folderName,
      type: folderType,
      color: folderColor
    });
    return folder;
  } catch (err) {
    console.warn(`${MODULE_ID} | Failed to create folder:`, err);
    return null;
  }
}
