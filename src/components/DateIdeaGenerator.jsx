import { useEffect, useState } from 'react';

function DateIdeaGenerator({ dateIdeas, onRefresh, isRefreshingContent }) {
  const [currentIdea, setCurrentIdea] = useState(() => pickRandomItem(dateIdeas));
  const [isPickingIdea, setIsPickingIdea] = useState(false);

  useEffect(() => {
    if (!dateIdeas.length) {
      setCurrentIdea(null);
      return;
    }

    setCurrentIdea((previousIdea) => {
      if (!previousIdea) {
        return pickRandomItem(dateIdeas);
      }

      const matchingIdea = dateIdeas.find((idea) => idea.id === previousIdea.id);
      return matchingIdea || pickRandomItem(dateIdeas);
    });
  }, [dateIdeas]);

  async function generateAnotherIdea() {
    setIsPickingIdea(true);

    try {
      const latestContent = await onRefresh?.();
      const availableIdeas = latestContent?.dateIdeas ?? dateIdeas;
      const nextIdea = pickDifferentRandomItem(availableIdeas, currentIdea?.id);

      setCurrentIdea(nextIdea);
    } finally {
      setIsPickingIdea(false);
    }
  }

  return (
    <section className="section-card section-card-dates" id="date-ideas">
      <div className="section-heading">
        <p className="section-kicker">
          <span aria-hidden="true">🍰</span>
          <span>Date Ideas</span>
        </p>
        <h2>Need a tiny plan for the next little adventure?</h2>
        <p className="section-intro">
          Pull a little plan from the pastel date-idea gacha.
        </p>
      </div>

      {!dateIdeas.length ? (
        <p className="empty-state">
          No active date ideas yet. Add one to your sheet and the generator will
          pick it up.
        </p>
      ) : (
        <div className="feature-panel feature-panel-date">
          <p className="feature-caption">Rare cozy plan found!</p>
          <p className="feature-quote">
            &quot;{currentIdea?.idea}&quot;
          </p>
          <p className="helper-chip">{currentIdea?.category || 'cute idea'}</p>
          <button
            className="button button-feature"
            type="button"
            onClick={generateAnotherIdea}
            disabled={isPickingIdea}
          >
            {isPickingIdea ? 'Checking for new ideas...' : 'Draw a date idea 🍰'}
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

export default DateIdeaGenerator;
