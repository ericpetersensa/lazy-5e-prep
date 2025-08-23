export async function createLazy5eJournal({ usePages }) {
  console.log(`📓 createLazy5eJournal called. usePages = ${usePages}`);

  try {
    if (usePages) {
      // Create a Journal with multiple Pages
      const journal = await JournalEntry.create({
        name: "Lazy DM Prep",
        pages: [
          { name: "Strong Start", type: "text", text: { content: "<p>Describe your strong start...</p>" } },
          { name: "Scenes", type: "text", text: { content: "<p>List your key scenes...</p>" } },
          { name: "Secrets", type: "text", text: { content: "<p>What secrets will be revealed...</p>" } }
        ]
      });
      return journal;
    } else {
      // Create a Journal with a single Page containing all steps
      const journal = await JournalEntry.create({
        name: "Lazy DM Prep",
        pages: [
          {
            name: "Prep",
            type: "text",
            text: {
              content: `
                <h2>Strong Start</h2>
                <p>Describe your strong start...</p>
                <h2>Scenes</h2>
                <p>List your key scenes...</p>
                <h2>Secrets</h2>
                <p>What secrets will be revealed...</p>
              `
            }
          }
        ]
      });
      return journal;
    }
  } catch (err) {
    console.error("❌ Error creating Lazy DM Prep journal:", err);
    return null;
  }
}
