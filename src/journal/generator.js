import { STEP_DEFS } from "../steps/index.js";

export async function createLazy5eJournal({ usePages }) {
  console.log(`📓 createLazy5eJournal called. usePages = ${usePages}`);

  try {
    // Format today's date as MM/DD/YYYY
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    const dateStamp = `${mm}/${dd}/${yyyy}`;

    // Ensure "Lazy DM Prep" folder exists
    let folder = game.folders.find(
      f => f.name === "Lazy DM Prep" && f.type === "JournalEntry"
    );
    if (!folder) {
      folder = await Folder.create({
        name: "Lazy DM Prep",
        type: "JournalEntry",
        color: "#d9a066"
      });
      console.log("📂 Created folder:", folder.name);
    }

    let journal;
    if (usePages) {
      // Multi‑page Journal: Page title only in Foundry's title bar
      const pages = STEP_DEFS.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return {
          name: `${stepNumber}${step.title}`,
          type: "text",
          text: {
            content: `
              <p>${step.description}</p>
              ${renderPlanned(step)}
            `
          },
          sort: idx * 100
        };
      });

      journal = await JournalEntry.create({
        name: `Lazy DM Prep – ${dateStamp}`,
        folder: folder.id,
        pages
      });

    } else {
      // Single‑page Journal: combined content without redundant headings
      const combinedContent = STEP_DEFS.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return `
          <p><strong>${stepNumber}${step.title}</strong></p>
          <p>${step.description}</p>
          ${renderPlanned(step)}
        `;
      }).join("<hr>");

      journal = await JournalEntry.create({
        name: `Lazy DM Prep – ${dateStamp}`,
        folder: folder.id,
        pages: [
          {
            name: "Prep",
            type: "text",
            text: { content: combinedContent }
          }
        ]
      });
    }

    return journal;

  } catch (err) {
    console.error("❌ Error creating Lazy DM Prep journal:", err);
    return null;
  }
}

// Render planned list items for a step
function renderPlanned(step) {
  if (!step.planned || !step.planned.length) return "";
  return `<ul>${step.planned
    .map(p => `<li><strong>${p.label}:</strong> ${p.note}</li>`)
    .join("")}</ul>`;
}
