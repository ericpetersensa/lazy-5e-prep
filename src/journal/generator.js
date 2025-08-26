// generator.js
const MODULE_ID = "lazy5e-tracker";

// ----------------------
// Step 0 generator
// ----------------------
export function generateStep0HTML() {
  // Keep this purely for *display* — no live logic here.
  let html = `<div class="lazy5e-step0">
    <h2>Last Seen Tracker</h2>
    <div class="lazy5e-placeholder">
      <!-- Live controls will be injected here -->
    </div>
  </div>`;
  return html;
}

// ----------------------
// Hook: inject live controls after render
// ----------------------
Hooks.on("renderJournalSheet", (app, html) => {
  // Only target Step 0 page in view mode
  if (!game.user.isGM) return;
  const pageTitle = app.document?.pages?.contents?.[0]?.name ?? "";
  if (!/Step\s*0/i.test(pageTitle)) return;

  const placeholder = html.find(".lazy5e-placeholder");
  if (!placeholder.length) return;

  // Build live controls
  const controls = $("<div class='lazy5e-controls'></div>");
  game.actors
    .filter(a => a.type === "character")
    .forEach(actor => {
      const lastSeen = actor.getFlag(MODULE_ID, "lastSeen") || "";
      controls.append(`
        <div class="lazy5e-row">
          <strong>${actor.name}</strong>
          <input type="date" data-actor-id="${actor.id}" data-flag="lastSeen" value="${lastSeen}">
          <button class="lazy5e-today" data-actor-id="${actor.id}" data-flag="lastSeen">Today</button>
        </div>
      `);
    });

  placeholder.append(controls);

  // Bindings: date change
  controls.on("change", "input[data-actor-id]", async ev => {
    const { actorId, flag } = ev.currentTarget.dataset;
    await game.actors
      .get(actorId)
      ?.setFlag(MODULE_ID, flag, ev.currentTarget.value);
  });

  // Bindings: Today button
  controls.on("click", ".lazy5e-today", async ev => {
    const { actorId, flag } = ev.currentTarget.dataset;
    const isoToday = new Date().toISOString().split("T")[0];
    const input = controls.find(
      `input[data-actor-id="${actorId}"][data-flag="${flag}"]`
    );
    input.val(isoToday).trigger("change");
  });
});
