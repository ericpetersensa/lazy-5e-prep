const MODULE_ID = "lazy5e-journal";

/**
 * Create a journal entry with actor-linked date fields
 */
export async function createLazy5eJournal(actor) {
  const journalName = `${actor.name} – Lazy5e Journal`;
  const existing = game.journal.contents.find(j => j.name === journalName);
  if (existing) return existing.sheet.render(true);

  const flags = actor.getFlag(MODULE_ID, "dates") || {};
  const fields = ["lastLongRest", "lastShortRest", "lastDowntime"];
  const isoToday = new Date().toISOString().split("T")[0];

  const content = fields.map(flag => {
    const label = flag.replace(/([A-Z])/g, " $1");
    const value = flags[flag] || "";
    return `
      <div class="lazy5e-date-field">
        <label>${label}</label>
        <input type="date" value="${value}" data-actor-id="${actor.id}" data-flag="${flag}" />
        <button class="lazy5e-today" data-actor-id="${actor.id}" data-flag="${flag}">Today</button>
      </div>
    `;
  }).join("");

  const entry = await JournalEntry.create({
    name: journalName,
    content: `<h2>${actor.name} – Rest Tracker</h2>${content}`,
    folder: null,
    flags: { [MODULE_ID]: { actorId: actor.id } }
  });

  entry.sheet.render(true);
}

/**
 * Hook: renderJournalSheet
 * Enables input saving and "Today" button functionality
 */
Hooks.on("renderJournalSheet", (app, element) => {
  if (!game.user.isGM) return;

  const html = element instanceof jQuery ? element : $(element);

  const saveDate = async (input) => {
    const actorId = input.dataset.actorId;
    const flag = input.dataset.flag;
    const value = input.value || "";
    const actor = game.actors.get(actorId);
    if (!actor) return;

    try {
      await actor.setFlag(MODULE_ID, flag, value);
      ui.notifications.info(`${actor.name} – ${flag.replace(/([A-Z])/g, " $1")} updated`);
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to update flag`, err);
    }
  };

  html.find("input[data-actor-id][data-flag]")
    .off(".lazy5e")
    .on("change.lazy5e blur.lazy5e", async ev => {
      await saveDate(ev.currentTarget);
    });

  html.find("button.lazy5e-today[data-actor-id][data-flag]")
    .off(".lazy5e")
    .on("click.lazy5e", async ev => {
      const btn = ev.currentTarget;
      const actorId = btn.dataset.actorId;
      const flag = btn.dataset.flag;
      const actor = game.actors.get(actorId);
      if (!actor) return;

      const isoToday = new Date().toISOString().split("T")[0];
      const selector = `input[data-actor-id="${actorId}"][data-flag="${flag}"]`;
      const input = html.find(selector)[0];
      if (input) {
        input.value = isoToday;
        input.dispatchEvent(new Event("change")); // Trigger save
      }

      try {
        await actor.setFlag(MODULE_ID, flag, isoToday);
        btn.textContent = "Today ✓";
        setTimeout(() => (btn.textContent = "Today"), 1000);
      } catch (err) {
        console.error(`${MODULE_ID} | Failed to set Today`, err);
      }
    });
});
