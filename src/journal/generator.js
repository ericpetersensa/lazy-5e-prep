import { STEP_DEFS } from "../steps/index.js";

const MODULE_ID = "lazy-5e-prep";

export async function createLazy5eJournal({ usePages }) {
  const journalName = "Lazy DM Prep";
  const folder = await getOrCreateFolder("Lazy Prep");

  const journal = await JournalEntry.create({
    name: journalName,
    folder: folder.id,
    flags: { [MODULE_ID]: true }
  });

  if (usePages) {
    const pages = STEP_DEFS.map((step, index) => {
      const title = step.numbered ? `${index + 1}. ${step.title}` : step.title;
      const content = renderStepContent(step);
      return {
        name: title,
        type: "text",
        text: { content, format: 1 }
      };
    });

    await journal.createEmbeddedDocuments("JournalEntryPage", pages);
  } else {
    const combinedContent = STEP_DEFS.map((step, index) => {
      const title = step.numbered ? `${index + 1}. ${step.title}` : step.title;
      const content = renderStepContent(step);
      return `<h2>${title}</h2>\n${content}`;
    }).join("\n<hr>\n");

    await journal.update({
      content: combinedContent
    });
  }

  return journal;
}

function renderStepContent(step) {
  const plannedItems = step.planned?.map(p => `<li><strong>${p.label}:</strong> ${p.note}</li>`).join("") || "";
  return `
    <p>${step.description}</p>
    ${plannedItems ? `<ul>${plannedItems}</ul>` : ""}
  `;
}

async function getOrCreateFolder(name) {
  let folder = game.folders.getName(name);
  if (!folder) {
    folder = await Folder.create({
      name,
      type: "JournalEntry",
      color: "#ffcc99",
      flags: { [MODULE_ID]: true }
    });
  }
  return folder;
}
