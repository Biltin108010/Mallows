function Home() {
  return (
    <section className="hero-card hero-card-home" id="home">
      <div className="hero-sticker hero-sticker-left" aria-hidden="true" />
      <div className="hero-sticker hero-sticker-right" aria-hidden="true" />
      <div className="hero-pixels" aria-hidden="true">
        <span className="hero-pixel hero-pixel-one" />
        <span className="hero-pixel hero-pixel-two" />
        <span className="hero-pixel hero-pixel-three" />
      </div>

      <div className="hero-content">
        <div className="hero-ribbon">
          <p className="eyebrow">Mallow&apos;s Space</p>
        </div>
        <p className="hero-prompt">press start, babi</p>
        <h1 className="hero-title">
          Hi babi, I made you a tiny place on the internet.
        </h1>
        <p className="hero-copy">
          A soft little corner for sweet notes, favorite memories, date ideas,
          and one secret tucked away just for us.
        </p>
      </div>

      <div className="hero-sidecar">
        <p className="hero-notelet">
          Choose a little menu option and see what sweet thing shows up.
        </p>
        <div className="hero-actions" aria-label="Primary app navigation">
          <a className="button button-nav button-love" href="#love-notes">
            <span className="button-icon" aria-hidden="true">💌</span>
            <span className="button-label">Love Notes</span>
          </a>
          <a className="button button-nav button-memory" href="#memories">
            <span className="button-icon" aria-hidden="true">📸</span>
            <span className="button-label">Memories</span>
          </a>
          <a className="button button-nav button-date" href="#date-ideas">
            <span className="button-icon" aria-hidden="true">🍰</span>
            <span className="button-label">Date Ideas</span>
          </a>
          <a className="button button-nav button-secret" href="#secret-page">
            <span className="button-icon" aria-hidden="true">🔐</span>
            <span className="button-label">Secret Page</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Home;
