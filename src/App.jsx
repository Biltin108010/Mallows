import { useCallback, useEffect, useRef, useState } from 'react';
import DateIdeaGenerator from './components/DateIdeaGenerator';
import Home from './components/Home';
import LoveNotes from './components/LoveNotes';
import MemoryGallery from './components/MemoryGallery';
import SecretPage from './components/SecretPage';
import { loadAppContent } from './services/contentService';

const initialContent = {
  loveNotes: [],
  memories: [],
  dateIdeas: [],
  secretMessages: [],
};

const REFRESH_INTERVAL_MS = 30000;

function App() {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notices, setNotices] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const mountedRef = useRef(false);
  const refreshTaskRef = useRef(null);

  const refreshContent = useCallback(async ({ showLoader = false } = {}) => {
    if (refreshTaskRef.current) {
      return refreshTaskRef.current;
    }

    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const task = (async () => {
      try {
        const result = await loadAppContent();

        if (!mountedRef.current) {
          return null;
        }

        setContent(result.content);
        setUsingFallback(result.usingFallback);
        setNotices(result.notices);
        return result.content;
      } catch {
        if (!mountedRef.current) {
          return null;
        }

        setUsingFallback(true);
        setNotices([
          'Something went wrong loading this little surprise. Try again in a bit.',
        ]);
        return null;
      } finally {
        refreshTaskRef.current = null;

        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    refreshTaskRef.current = task;
    return task;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refreshContent({ showLoader: true });

    return () => {
      mountedRef.current = false;
    };
  }, [refreshContent]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        refreshContent();
      }
    }

    const intervalId = window.setInterval(() => {
      refreshContent();
    }, REFRESH_INTERVAL_MS);

    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshContent]);

  return (
    <div className="app-shell">
      <div className="page-glow page-glow-left" aria-hidden="true" />
      <div className="page-glow page-glow-right" aria-hidden="true" />

      <main className="app-content">
        <Home />

        {notices.length ? (
          <div className="status-banner" role="status">
            <p>{notices[0]}</p>
          </div>
        ) : null}

        {usingFallback ? (
          <div className="setup-note">
            <p>
              Tip: connect Google Sheets later with the `VITE_*_URL` variables
              and your updates can appear without redeploying.
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <section className="section-card">
            <div className="loading-block">
              <p>Loading your little surprise...</p>
            </div>
          </section>
        ) : (
          <>
            <LoveNotes
              notes={content.loveNotes}
              onRefresh={refreshContent}
              isRefreshingContent={isRefreshing}
            />
            <MemoryGallery memories={content.memories} />
            <DateIdeaGenerator
              dateIdeas={content.dateIdeas}
              onRefresh={refreshContent}
              isRefreshingContent={isRefreshing}
            />
            <SecretPage secretMessages={content.secretMessages} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
