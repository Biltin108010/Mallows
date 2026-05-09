# Mallow's Space

A small React + Vite web app gift with:

- a welcome screen
- random little notes
- a memory gallery
- a random date idea generator
- a secret section unlocked by an inside-joke password
- Google Sheets-friendly content loading with local fallback content

## Local setup

1. Install Node.js 18+.
2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Create a production build:

```bash
npm run build
```

5. Run linting:

```bash
npm run lint
```

## Google Sheets configuration

Copy `.env.example` to `.env` and set any of these values:

```bash
VITE_LOVE_NOTES_URL=
VITE_MEMORIES_URL=
VITE_DATE_IDEAS_URL=
VITE_SECRET_MESSAGES_URL=
```

Each URL can point to a published CSV or JSON endpoint. The app also supports
Google Visualization JSON responses.

Suggested sheet tabs:

- `Love Notes`
- `Memories`
- `Date Ideas`
- `Secret Messages`

Suggested columns:

### Love Notes

`id | note | category | active`

### Memories

`id | title | caption | imageUrl | date | active`

### Date Ideas

`id | idea | category | active`

### Secret Messages

`id | title | message | unlockKey | active`

If any URL is missing or a request fails, the app falls back to the local data
inside `src/data/fallbackContent.js`.
