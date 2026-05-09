import { useState } from 'react';

function SecretPage({ secretMessages }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [revealedMessages, setRevealedMessages] = useState([]);

  const hasMessages = secretMessages.length > 0;

  function handleUnlock(event) {
    event.preventDefault();

    if (!hasMessages) {
      return;
    }

    const normalizedPassword = password.trim().toLowerCase();
    const matches = secretMessages.filter(
      (message) => message.unlockKey.trim().toLowerCase() === normalizedPassword,
    );

    if (!normalizedPassword || !matches.length) {
      setError('Not quite, love. Try our little secret again ♡');
      setRevealedMessages([]);
      return;
    }

    setError('');
    setRevealedMessages(matches);
  }

  return (
    <section className="section-card section-card-secret" id="secret-page">
      <div className="section-heading">
        <p className="section-kicker">
          <span aria-hidden="true">🔐</span>
          <span>Secret Page</span>
        </p>
        <h2>A secret little letter, tucked away just for you</h2>
        <p className="section-intro">
          Like a hidden menu screen guarding one extra love letter.
        </p>
      </div>

      {!hasMessages ? (
        <p className="empty-state">
          No active secret messages yet. Add one with an unlock key and it will
          be ready here.
        </p>
      ) : (
        <div className="secret-shell">
          <form className="secret-form" onSubmit={handleUnlock}>
            <label className="secret-label" htmlFor="secret-password">
              Enter a little phrase only we would know
            </label>
            <div className="secret-input-row">
              <input
                id="secret-password"
                className="secret-input"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Type our little phrase"
                autoComplete="off"
              />
              <button className="button button-feature" type="submit">
                Unlock secret letter 🔐
              </button>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </form>

          {revealedMessages.length ? (
            <div className="secret-grid">
              {revealedMessages.map((message) => (
                <article className="secret-card" key={message.id}>
                  <h3>{message.title}</h3>
                  <p>{message.message}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="helper-text">
              The letter stays sealed until the right little password shows up.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default SecretPage;
