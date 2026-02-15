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
              </div>
              <div className="t-card-info">
                <span className="t-song-name">{song.title}</span>
                <span className="t-artist-name">{song.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                  <div className="row-meta-premium">{song.artist}</div>
                </div>
                <div className="explore-tag">EXPLORE</div>
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

        .card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .trending-card-premium:hover .card-overlay {
          opacity: 1;
        }

        .play-btn-circle {
          width: 40px;
          height: 40px;
          background: white;
          color: black;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          padding-left: 3px;
        }

        .t-card-info {
          padding: var(--space-sm) 0;
          display: flex;
          flex-direction: column;
        }

        .t-song-name {
          font-weight: 700;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .t-artist-name {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .modern-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .song-row-premium {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .song-row-premium:hover {
          background: rgba(255,255,255,0.03);
          transform: scale(1.02);
        }

        .row-thumb-modern {
          width: 54px;
          height: 54px;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .song-info {
          flex: 1;
        }

        .row-title-premium {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .row-meta-premium {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .explore-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--primary);
          border: 1px solid var(--primary-glow);
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--primary-glow);
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
