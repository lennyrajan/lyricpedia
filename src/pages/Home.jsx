import React, { useEffect, useState, useRef, useCallback } from 'react';
import { songService } from '../services/songService';

const Home = ({ onSongSelect }) => {
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const lastSongElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [t, nr] = await Promise.all([
        songService.getTrending(),
        songService.getNewReleases(0, 12)
      ]);
      setTrending(t);
      setNewReleases(nr);
      setLoading(false);
      if (nr.length < 12) setHasMore(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (page === 0) return;
    const loadMore = async () => {
      setLoadingMore(true);
      const moreSongs = await songService.getNewReleases(page, 12);
      if (moreSongs.length === 0) {
        setHasMore(false);
      } else {
        setNewReleases(prev => [...prev, ...moreSongs]);
        if (moreSongs.length < 12) setHasMore(false);
      }
      setLoadingMore(false);
    };
    loadMore();
  }, [page]);

  if (loading) return (
    <div className="loading-state">
      <div className="discovery-loader"></div>
      <span>DISCOVERING THE WORLD'S BEAT...</span>
    </div>
  );

  return (
    <div className="home-page">
      <section className="trending-section">
        <div className="section-header">
          <h2 className="title-premium">Top Trends</h2>
          <span className="subtitle">Globally indexed today</span>
        </div>
        <div className="horizontal-scroll">
          {trending.map(song => (
            <div key={song.id} className="trending-card-premium" onClick={() => onSongSelect(song)}>
              <div className="card-img-container">
                <img src={song.image} alt={song.title} className="t-card-img" />
                <div className="card-overlay">
                  <span className="play-btn-circle">➤</span>
                </div>
                <div className="card-badge">{song.language}</div>
              </div>
              <div className="t-card-info">
                <span className="t-song-name">{song.title}</span>
                <span className="t-artist-name">{song.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {newReleases.some(s => s.language !== 'English') && (
        <section className="regional-spotlight">
          <div className="section-header">
            <h2 className="title-premium">Global Spotlight</h2>
            <span className="subtitle">Regional Essentials & Hits</span>
          </div>
          <div className="horizontal-scroll">
            {newReleases.filter(s => s.language !== 'English').slice(0, 10).map(song => (
              <div key={`regional-${song.id}`} className="trending-card-premium" onClick={() => onSongSelect(song)}>
                <div className="card-img-container">
                  <img src={song.image} alt={song.title} className="t-card-img" />
                  <div className="card-badge regional">{song.language}</div>
                </div>
                <div className="t-card-info">
                  <span className="t-song-name">{song.title}</span>
                  <span className="t-artist-name">{song.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="new-releases">
        <div className="section-header">
          <h2 className="title-premium">Fresh Hits</h2>
          <span className="subtitle">Last 48 hours of music metadata</span>
        </div>
        <div className="modern-list">
          {newReleases.map((song, index) => {
            const isLast = newReleases.length === index + 1;
            return (
              <div
                ref={isLast ? lastSongElementRef : null}
                key={song.id}
                className="song-row-premium glass-panel"
                onClick={() => onSongSelect(song)}
              >
                <img src={song.image} alt={song.title} className="row-thumb-modern" />
                <div className="song-info">
                  <div className="row-title-premium">{song.title}</div>
                  <div className="row-meta-premium">{song.artist} • <span className="lang-text">{song.language}</span></div>
                </div>
                <div className="explore-tag">{song.genre || 'POP'}</div>
              </div>
            );
          })}
        </div>
        {loadingMore && (
          <div className="loading-more">
            <div className="mini-loader"></div>
            INDEXING MORE...
          </div>
        )}
      </section>

      <style jsx>{`
        .home-page {
          padding-top: var(--space-md);
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .section-header {
          margin-bottom: var(--space-lg);
          padding: 0 var(--space-xs);
        }

        .title-premium {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 2px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .trending-card-premium {
          flex: 0 0 160px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .trending-card-premium:hover {
          transform: translateY(-8px);
        }

        .card-img-container {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          aspect-ratio: 1;
        }

        .t-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .trending-card-premium:hover .t-card-img {
          transform: scale(1.1);
        }

        .card-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          color: white;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 2;
        }

        .card-badge.regional {
          background: var(--primary);
        }

        .regional-spotlight {
          margin-bottom: var(--space-xl);
          animation: slideIn 0.6s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .lang-text {
          color: var(--primary);
          font-weight: 700;
        }

        .explore-tag {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--text-main);
          border: 1px solid var(--glass-border);
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          text-transform: uppercase;
        }

        .loading-state, .loading-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          color: var(--text-dim);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          gap: var(--space-md);
        }

        .discovery-loader {
          width: 40px;
          height: 40px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .mini-loader {
          width: 20px;
          height: 20px;
          border: 2px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
