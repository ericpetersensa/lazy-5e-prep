// generator.js — Lazy 5e Prep (v13-friendly, wired-up + verbose logging)

// Fortified folder helper
async function getSessionPrepFolderId() {
  if (getSessionPrepFolderId._cache) {
    console.log("Lazy 5e Prep | Using cached folder ID:", getSessionPrepFolderId._cache);
    return getSessionPrepFolderId._cache;
  }

  console.log("Lazy 5e Prep | Checking for existing 'Session Prep' JournalEntry folder…");

  let folder = game.folders.find(f =>
    f.type === "JournalEntry" &&
    f.name.toLowerCase() === "session prep"
  );

  if (!folder) {
    try {
      console.log("Lazy 5e Prep | No matching folder found, creating…");
      folder = await Folder.create({
        name: "Session Prep",
        type: "JournalEntry",
        color: "#85bcde"
      });
      console.log("Lazy 5e Prep | Folder created successfully:", folder);
    } catch (err) {
      console.error("Lazy 5e Prep | Error creating 'Session Prep' folder:", err);
      return undefined;
    }
  } else {
    console.log("Lazy 5e Prep | Found existing folder:", folder);
  }

  getSessionPrepFolderId._cache = folder.id;
  return folder.id;
}

// Main journal generator
async function createLazy5eJournal() {
  try {
    const folderId = await getSessionPrepFolderId();

    const entryData = {
      name: "Lazy DM Prep",
      folder: folderId || null,
      pages: [
        {
          name: "Prep Outline",
          type: "text",
          text: {
            content: `<h2>Strong Start</h2>
<p>Describe an evocative opening scene.</p>

<h2>Secrets & Clues</h2>
<ul><li>...</li></ul>

<h2>Fantastic Locations</h2>
<ul><li>...</li></ul>

<h2>NPCs</h2>
<ul><li>...</li></ul>

<h2>Monsters</h2>
<ul><li>...</li></ul>

<h2>Treasure</h2>
<ul><li>...</li></ul>

<h2>Next Steps</h2>
<ul><li>...</li></ul>`
          }
        }
      ]
    };

    const journal = await JournalEntry.create(entryData);
    console.log("Lazy 5e Prep | Journal created:", journal);
    ui.notifications.info("Lazy DM Prep journal created successfully.");
  } catch (err) {
    console.error("Lazy 5e Prep | Error creating journal:", err);
    ui.notifications.error("Lazy DM Prep journal could not be created — see console.");
  }
}

// Bind to Generate button only after Foundry is ready
Hooks.once("ready", () => {
  const button = document.getElementById("lazy5e-generate");
  if (button) {
    button.addEventListener("click", () => {
      console.log("Lazy 5e Prep | Generate button clicked.");
      createLazy5eJournal();
    });
    console.log("Lazy 5e Prep | Generate button wired up and ready.");
  } else {
    console.warn("Lazy 5e Prep | Generate button not found in DOM.");
  }
});
