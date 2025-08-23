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

    // Build updated step content with dynamic PC listing in step 0
    const stepsWithDynamicContent = await Promise.all(
      STEP_DEFS.map(async (step, idx) => {
        if (idx === 0) {
          // REVIEW THE CHARACTERS PAGE with portraits + links
          const pcs = game.actors.filter(a =>
            !["npc", "vehicle", "monster"].includes(a.type)
          );

          const actorHTML = pcs.map(a => {
            const portrait = a.img || "icons/svg/mystery-man.svg";
            return `
              <div style="display:flex; align-items:center; gap:0.5em; margin-bottom:1em;">
                <img src="${portrait}" alt="${a.name}" width="48" height="48" style="border:1px solid #555; border-radius:4px;">
                <a data-entity-link data-type="Actor" data-id="${a.id}"><strong>${a.name}</strong></a>
              </div>
              <hr style="margin:1em 0;">
            `;
          }).join("");

          return {
            ...step,
            extraContent: actorHTML
          };
        }
        return { ...step, extraContent: "" };
      })
    );

    let journal;
    if (usePages) {
      const pages = stepsWithDynamicContent.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return {
          name: `${stepNumber}${step.title}`,
          type: "text",
          text: {
            content: `
              <p>${step.description}</p>
              ${renderPlanned(step)}
              ${step.extraContent || ""}
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
      const combinedContent = stepsWithDynamicContent.map((step, idx) => {
        const stepNumber = step.numbered ? `${idx + 1}. ` : "";
        return `
          <p><strong>${stepNumber}${step.title}</strong></p>
          <p>${step.description}</p>
          ${renderPlanned(step)}
          ${step.extraContent || ""}
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

function renderPlanned(step) {
  if (!step.planned || !step.planned.length) return "";
  return `<ul>${step.planned
    .map(p => `<li><strong>${p.label}:</strong> ${p.note}</li>`)
    .join("")}</ul>`;
}
