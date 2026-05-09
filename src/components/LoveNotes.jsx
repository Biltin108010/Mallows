import { useEffect, useState } from 'react';

function LoveNotes({ notes, onRefresh, isRefreshingContent }) {
  const [currentNote, setCurrentNote] = useState(() => pickRandomItem(notes));
  const [isPickingNote, setIsPickingNote] = useState(false);

  useEffect(() => {
    if (!notes.length) {
      setCurrentNote(null);
      return;
    }

    setCurrentNote((previousNote) => {
      if (!previousNote) {
        return pickRandomItem(notes);
      }

      const matchingNote = notes.find((note) => note.id === previousNote.id);
      return matchingNote || pickRandomItem(notes);
    });
  }, [notes]);

  async function showAnotherNote() {
    setIsPickingNote(true);

    try {
      const latestContent = await onRefresh?.();
      const availableNotes = latestContent?.loveNotes ?? notes;
      const nextNote = pickDifferentRandomItem(availableNotes, currentNote?.id);

      setCurrentNote(nextNote);
    } finally {
      setIsPickingNote(false);
    }
  }

  return (
    <section className="section-card section-card-notes" id="love-notes">
      <div className="section-heading">
        <p className="section-kicker">
          <span aria-hidden="true">💌</span>
          <span>Love Notes</span>
        </p>
        <h2>Little reminders, picked at random</h2>
        <p className="section-intro">
          Like a sweet dialogue box opening up just for you.
        </p>
      </div>

      {!notes.length ? (
        <p className="empty-state">
          No active love notes yet. Add one to your sheet and it will pop up
          here.
        </p>
      ) : (
        <div className="feature-panel feature-panel-note">
          <p className="feature-caption">Sweet message received!</p>
          <p className="feature-quote">
            &quot;{currentNote?.note}&quot;
          </p>
          <p className="helper-chip">{currentNote?.category || 'sweet note'}</p>
          <button
            className="button button-feature"
            type="button"
            onClick={showAnotherNote}
            disabled={isPickingNote}
          >
            {isPickingNote
              ? 'Checking for new notes...'
              : 'Pick another little reminder 💌'}
          </button>
          {isRefreshingContent ? (
            <p className="helper-text">
              Syncing the latest sheet updates in the background.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function pickDifferentRandomItem(items, currentId) {
  if (!items.length) {
    return null;
  }

  if (items.length === 1) {
    return items[0];
  }

  let nextItem = pickRandomItem(items);

  while (nextItem?.id === currentId) {
    nextItem = pickRandomItem(items);
  }

  return nextItem;
}

function pickRandomItem(items) {
  if (!items.length) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

export default LoveNotes;
