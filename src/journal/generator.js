import { STEP_DEFS } from "../steps/index.js";

const MODULE_ID = "lazy-5e-prep";

export async function createLazy5eJournal({ usePages }) {
  console.log(`📓 createLazy5eJournal called. usePages = ${usePages}`);

  try {
    // Format today's date as MM/DD/YYYY for the Journal title
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
          // REVIEW THE CHARACTERS: portraits + @Actor links + date tracking + Today buttons
          const pcs = game.actors.filter(a =>
            !["npc", "vehicle", "monster"].includes(a.type)
          );

          const actorHTML = await Promise.all(
            pcs.map(async a => {
              const portrait = a.img || "icons/svg/mystery-man.svg";
              const lastSeenRaw = a.getFlag(MODULE_ID, "lastSeen") || "";
              const lastSpotlightRaw = a.getFlag(MODULE_ID, "lastSpotlight") || "";
              const lastSeen = toInputDate(lastSeenRaw);
              const lastSpotlight = toInputDate(lastSpotlightRaw);
              const link = `@Actor[${a.id}]{${a.name}}`;

              return `
                <div class="lazy5e-actor" data-actor-id="${a.id}">
                  <div style="display:flex; align-items:center; gap:0.5em; margin-bottom:0.5em;">
                    <img src="${portrait}" alt="${a.name}" width="48" height="48" style="border:1px solid #555; border-radius:4px;">
                    ${link}
                  </div>
                  <div class="lazy5e-dates" style="margin-left:3em; font-size:0.9em; display:flex; gap:1em; align-items:center; flex-wrap:wrap;">
                    <label>Last Seen:
                      <input type="date" data-actor-id="${a.id}" data-flag="lastSeen" value="${lastSeen}">
                    </label>
                    <button type="button" class="lazy5e-today" data-actor-id="${a.id}" data-flag="lastSeen">Today</button>

                    <label>Last Spotlight:
                      <input type="date" data-actor-id="${a.id}" data-flag="lastSpotlight" value="${lastSpotlight}">
                    </label>
                    <button type="button" class="lazy5e-today" data-actor-id="${a.id}" data-flag="lastSpotlight">Today</button>
                  </div>
                </div>
                <hr style="margin:1em 0;">
              `;
            })
          );

          return { ...step, extraContent: actorHTML.join("") };
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
    console.error(`❌ ${MODULE_ID} | Error creating Lazy DM Prep journal:`, err);
    return null;
  }
}

function renderPlanned(step) {
  if (!step.planned || !step.planned.length) return "";
  return `<ul>${step.planned
    .map(p => `<li><strong>${p.label}:</strong> ${p.note}</li>`)
    .join("")}</ul>`;
}

// Normalize stored date to "YYYY-MM-DD" format for <input type="date">
function toInputDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const mdy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const m = value.match(mdy);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;
  return "";
}

/* ---------------------------------
   Update Actor Flags from Journal (v13-safe)
----------------------------------- */
Hooks.on("renderJournalSheet", (app, element) => {
  if (!game.user.isGM) return;

  const html = element instanceof jQuery ? element : $(element);

  // Change handler for date inputs
  html.find("input[data-actor-id][data-flag]")
    .off("change.lazy5e")
    .on("change.lazy5e", async ev => {
      const input = ev.currentTarget;
      const actorId = input.dataset.actorId;
      const flag = input.dataset.flag;
      const iso = input.value || "";

      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.warn("Actor not found for update.");
        return;
      }

      try {
        await actor.setFlag(MODULE_ID, flag, iso);
        ui.notifications.info(`${actor.name} – ${flag.replace(/([A-Z])/g, " $1")} updated`);
      } catch (e) {
        console.error(`${MODULE_ID} | Failed to set flag`, e);
        ui.notifications.error("Failed to update date. See console.");
      }
    });

  // Click handler for "Today" buttons
  html.find("button.lazy5e-today[data-actor-id][data-flag]")
    .off("click.lazy5e")
    .on("click.lazy5e", async ev => {
      const btn = ev.currentTarget;
      const actorId = btn.dataset.actorId;
      const flag = btn.dataset.flag;

      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.warn("Actor not found for update.");
        return;
      }

      // Today in ISO for <input type="date">
      const isoToday = new Date().toISOString().split("T")[0];

      // Set the input's value in the DOM and trigger change
      const selector = `input[data-actor-id="${actorId}"][data-flag="${flag}"]`;
      const $input = html.find(selector);
      if ($input.length) {
        $input.val(isoToday).trigger("change");
      }

      try {
        await actor.setFlag(MODULE_ID, flag, isoToday);
        const original = btn.textContent;
        btn.textContent = "Today ✓";
        setTimeout(() => (btn.textContent = original), 1000);
        ui.notifications.info(`${actor.name} – ${flag.replace(/([A-Z])/g, " $1")} set to Today`);
      } catch (e) {
        console.error(`${MODULE_ID} | Failed to set Today`, e);
        ui.notifications.error("Failed to set Today. See console.");
      }
    });
});
