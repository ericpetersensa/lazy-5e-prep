import { STEP_DEFS } from "../steps/index.js";

export async function createLazy5eJournal({ usePages }) {
  console.log(`📓 createLazy5eJournal called. usePages = ${usePages}`);

  try {
    // 1. Ensure "Lazy DM Prep" folder exists
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
      // One journal with multiple Pages (numbered if flagged)
      journal = await JournalEntry.create({
        name: "Lazy DM Prep",
        folder: folder.id,
        pages: STEP_DEFS.map((step, idx) => {
          const stepNumber = step.numbered ? `${idx + 1}. ` : "";
          return {
            name: `${stepNumber}${step.title}`,
            type: "text",
            text: {
              content: `
                <h2>${stepNumber}${step.title}</h2>
                <p>${step.description}</p>
                ${step.numbered ? `<ol><li></li></ol>` : `<p></p>`}
              `
            },
            sort: idx * 100
          };
        })
      });
    } else {
      // One journal with all steps in a single Page
      const combinedContent = STEP_DEFS.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return `
          <h2>${stepNumber}${step.title}</h2>
          <p>${step.description}</p>
          ${step.numbered ? `<ol><li></li></ol>` : `<p></p>`}
        `;
      }).join("");

      journal = await JournalEntry.create({
        name: "Lazy DM Prep",
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
