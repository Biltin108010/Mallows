import { useState } from 'react';

function MemoryGallery({ memories }) {
  return (
    <section className="section-card section-card-memories" id="memories">
      <div className="section-heading">
        <p className="section-kicker">
          <span aria-hidden="true">📸</span>
          <span>Memories</span>
        </p>
        <h2>Snapshots of your favorite little moments</h2>
        <p className="section-intro">
          A little save file full of moments worth keeping forever.
        </p>
      </div>

      {!memories.length ? (
        <p className="empty-state">
          No active memories yet. Add a photo, title, or caption to your sheet
          and they will appear here.
        </p>
      ) : (
        <div className="memory-grid">
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

function MemoryCard({ memory, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(memory.imageUrl) && !imageFailed;

  return (
    <article
      className="memory-card"
      data-slot-label={`save ${String(index + 1).padStart(2, '0')}`}
      data-tilt={index % 2 === 0 ? 'left' : 'right'}
    >
      <div className="memory-image-shell">
        {showImage ? (
          <img
            className="memory-image"
            src={memory.imageUrl}
            alt={memory.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="memory-placeholder" aria-hidden="true">
            <span>Memory loading... ♡</span>
          </div>
        )}
      </div>

      <div className="memory-copy">
        <div className="memory-meta">
          <h3>{memory.title}</h3>
          {memory.date ? (
            <p className="memory-date-chip">{formatDate(memory.date)}</p>
          ) : null}
        </div>
        <p>{memory.caption || 'A tiny moment worth keeping close.'}</p>
      </div>
    </article>
  );
}

function formatDate(dateString) {
  const parsedDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

export default MemoryGallery;
