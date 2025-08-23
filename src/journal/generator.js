import { STEP_DEFS } from "../steps/index.js";

export async function createLazy5eJournal({ usePages }) {
  console.log(`📓 createLazy5eJournal called. usePages = ${usePages}`);

  try {
    // Format today's date as YYYY-MM-DD
    const today = new Date();
    const dateStamp = today.toISOString().split("T")[0];

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
      // One Journal with multiple Pages — each page gets a real name & content
      const pages = STEP_DEFS.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return {
          name: `${stepNumber}${step.title}`, // This is the Page Title in Foundry
          type: "text",
          text: {
            content: `
              <h2>${stepNumber}${step.title}</h2>
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
      // One Journal with a single Page combining all steps
      const combinedContent = STEP_DEFS.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return `
          <h2>${stepNumber}${step.title}</h2>
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
