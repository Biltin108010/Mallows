import {
  fallbackDateIdeas,
  fallbackLoveNotes,
  fallbackMemories,
  fallbackSecretMessages,
} from '../data/fallbackContent';

const LOAD_ERROR_MESSAGE =
  'Something went wrong loading this little surprise. Try again in a bit.';

const CONTENT_CONFIG = {
  loveNotes: {
    envKey: 'VITE_LOVE_NOTES_URL',
    fallback: fallbackLoveNotes,
    mapRow: mapLoveNote,
  },
  memories: {
    envKey: 'VITE_MEMORIES_URL',
    fallback: fallbackMemories,
    mapRow: mapMemory,
  },
  dateIdeas: {
    envKey: 'VITE_DATE_IDEAS_URL',
    fallback: fallbackDateIdeas,
    mapRow: mapDateIdea,
  },
  secretMessages: {
    envKey: 'VITE_SECRET_MESSAGES_URL',
    fallback: fallbackSecretMessages,
    mapRow: mapSecretMessage,
  },
};

export async function loadAppContent() {
  const entries = await Promise.all(
    Object.entries(CONTENT_CONFIG).map(async ([key, config]) => [
      key,
      await loadCollection(config),
    ]),
  );

  const content = {};
  const notices = [];
  let usingFallback = false;

  for (const [key, result] of entries) {
    content[key] = result.items;
    usingFallback = usingFallback || result.source !== 'remote';

    if (result.notice) {
      notices.push(result.notice);
    }
  }

  return {
    content,
    usingFallback,
    notices: Array.from(new Set(notices)),
  };
}

async function loadCollection(config) {
  const fallbackItems = normalizeItems(config.fallback, config.mapRow);
  const remoteUrl = getEnvValue(config.envKey);

  if (!remoteUrl) {
    return {
      items: fallbackItems,
      source: 'fallback-missing-url',
      notice: null,
    };
  }

  try {
    const rows = await fetchRows(remoteUrl);
    const items = normalizeItems(rows, config.mapRow);

    return {
      items,
      source: 'remote',
      notice: null,
    };
  } catch (error) {
    return {
      items: fallbackItems,
      source: 'fallback-error',
      notice: LOAD_ERROR_MESSAGE,
      error,
    };
  }
}

function normalizeItems(rows, mapRow) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapRow(row))
    .filter(Boolean)
    .filter((item) => item.active);
}

async function fetchRows(url) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const rawText = await response.text();

  if (!rawText.trim()) {
    return [];
  }

  if (contentType.includes('application/json') || looksLikeJson(rawText)) {
    return parseJsonRows(rawText);
  }

  if (looksLikeGoogleVisualization(rawText)) {
    return parseGoogleVisualizationRows(rawText);
  }

  return parseCsvRows(rawText);
}

function looksLikeJson(value) {
  const text = value.trim();
  return text.startsWith('{') || text.startsWith('[');
}

function looksLikeGoogleVisualization(value) {
  return value.includes('google.visualization.Query.setResponse');
}

function parseJsonRows(rawText) {
  const parsed = JSON.parse(rawText);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed?.rows)) {
    return parsed.rows;
  }

  if (Array.isArray(parsed?.data)) {
    return parsed.data;
  }

  if (Array.isArray(parsed?.values)) {
    return parsed.values;
  }

  if (Array.isArray(parsed?.items)) {
    return parsed.items;
  }

  return [];
}

function parseGoogleVisualizationRows(rawText) {
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');

  if (start === -1 || end === -1) {
    return [];
  }

  const parsed = JSON.parse(rawText.slice(start, end + 1));
  const cols = parsed?.table?.cols ?? [];
  const rows = parsed?.table?.rows ?? [];

  return rows.map((row) => {
    const cells = row?.c ?? [];
    const entry = {};

    cols.forEach((col, index) => {
      const key = sanitizeKey(col?.label || col?.id || `column_${index}`);
      const cell = cells[index];
      entry[key] = cell?.f ?? cell?.v ?? '';
    });

    return entry;
  });
}

function parseCsvRows(rawText) {
  const rows = parseCsvTable(rawText);

  if (!rows.length) {
    return [];
  }

  const [headerCells, ...bodyRows] = rows;
  const headers = headerCells.map((header, index) =>
    sanitizeKey(header || `column_${index}`),
  );

  return bodyRows
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => {
      const row = {};

      headers.forEach((header, index) => {
        row[header] = cells[index] ?? '';
      });

      return row;
    });
}

function parseCsvTable(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];

    if (char === '"') {
      const escapedQuote = normalized[index + 1] === '"';

      if (escapedQuote) {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell || currentRow.length) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell !== ''));
}

function mapLoveNote(row) {
  const note = getFirstValue(row, ['note']);

  if (!note) {
    return null;
  }

  return {
    id: getFirstValue(row, ['id']) || cryptoRandomId('note'),
    note,
    category: getFirstValue(row, ['category']) || 'sweet',
    active: normalizeBoolean(getFirstValue(row, ['active'])),
  };
}

function mapMemory(row) {
  const rawTitle = getFirstValue(row, ['title']);
  const caption = getFirstValue(row, ['caption']);
  const imageUrl = getFirstValue(row, ['imageurl', 'image_url', 'image']);
  const date = getFirstValue(row, ['date']);
  const hasDisplayContent = rawTitle || caption || imageUrl;

  if (!hasDisplayContent) {
    return null;
  }

  return {
    id: getFirstValue(row, ['id']) || cryptoRandomId('memory'),
    title: rawTitle || 'A sweet memory',
    caption,
    imageUrl,
    date,
    active: normalizeBoolean(getFirstValue(row, ['active'])),
  };
}

function mapDateIdea(row) {
  const idea = getFirstValue(row, ['idea']);

  if (!idea) {
    return null;
  }

  return {
    id: getFirstValue(row, ['id']) || cryptoRandomId('idea'),
    idea,
    category: getFirstValue(row, ['category']) || 'cute',
    active: normalizeBoolean(getFirstValue(row, ['active'])),
  };
}

function mapSecretMessage(row) {
  const title = getFirstValue(row, ['title']) || 'A secret note';
  const message = getFirstValue(row, ['message']);
  const unlockKey = getFirstValue(row, ['unlockkey', 'unlock_key', 'password']);

  if (!message || !unlockKey) {
    return null;
  }

  return {
    id: getFirstValue(row, ['id']) || cryptoRandomId('secret'),
    title,
    message,
    unlockKey,
    active: normalizeBoolean(getFirstValue(row, ['active'])),
  };
}

function getFirstValue(row, keys) {
  if (!row || typeof row !== 'object') {
    return '';
  }

  for (const key of keys) {
    const matchingKey = Object.keys(row).find(
      (entryKey) => sanitizeKey(entryKey) === sanitizeKey(key),
    );

    if (matchingKey) {
      return normalizeText(row[matchingKey]);
    }
  }

  return '';
}

function getEnvValue(key) {
  const value = import.meta.env?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = normalizeText(value).toLowerCase();
  return ['true', '1', 'yes', 'y', 'active'].includes(normalized);
}

function normalizeText(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function sanitizeKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '');
}

function cryptoRandomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
