import React from 'react';

const SongDetail = ({ song, onBack, onArtistSelect, onAlbumSelect, onHubSelect }) => {
  if (!song) return null;

  const handleSpotifySearch = () => {
    const query = `${song.title} ${song.artist}`;
    window.open(`https://open.spotify.com/search/${encodeURIComponent(query)}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lyriverse - ${song.title}`,
          text: `Check out the lyrics for ${song.title} by ${song.artist} on Lyriverse!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="song-detail-page">
      <div className="detail-header">
        <button className="back-btn-premium" onClick={onBack}>
          <span className="icon">←</span>
          <span className="text">Discovery</span>
        </button>
      </div>

      <div className="detail-layout-grid">
        <div className="visual-column">
          <div className="song-visual-container">
            <div className="blurred-bg" style={{ backgroundImage: `url(${song.image})` }}></div>
            <div className="sharp-img-hero glass-panel">
              <img src={song.image} alt={song.title} className="hero-img-sharp" />
            </div>
          </div>

          <div className="song-ident">
            <h1 className="song-title-premium">{song.title}</h1>
            <button className="artist-chip" onClick={() => onArtistSelect(song.artist)}>
              {song.artist}
            </button>
          </div>

          <div className="action-row desktop-only">
            <button className="btn-spotify" onClick={handleSpotifySearch}>OPEN IN SPOTIFY</button>
            <button className="btn-share" onClick={handleShare}>SHARE TRACK</button>
          </div>
        </div>

        <div className="content-column">
          <div className="content-grid-internal">
            <div className="metadata-vertical glass-panel">
              <div className="meta-card clickable" onClick={() => onAlbumSelect(song.album)}>
                <span className="m-label">ALBUM</span>
                <span className="m-value">{song.album}</span>
              </div>
              <div className="meta-card clickable" onClick={() => onHubSelect('language', song.language)}>
                <span className="m-label">LANGUAGE</span>
                <span className="m-value">{song.language}</span>
              </div>
              <div className="meta-card clickable" onClick={() => onHubSelect('genre', song.genre)}>
                <span className="m-label">GENRE</span>
                <span className="m-value">{song.genre}</span>
              </div>
              <div className="meta-card">
                <span className="m-label">YEAR</span>
                <span className="m-value">{song.year}</span>
              </div>
            </div>

            <div className="lyrics-snippet-card glass-panel">
              <div className="card-header">
                <span className="dot"></span>
                LYRICS SNIPPET
              </div>
              <p className="lyrics-content">
                {song.snippet}
              </p>
              <div className="trademark-note">
                LYRIVERSE INDEXED CONTENT • COPYRIGHT SAFE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-row mobile-only">
        <button className="btn-spotify" onClick={handleSpotifySearch}>OPEN IN SPOTIFY</button>
        <button className="btn-share" onClick={handleShare}>SHARE TRACK</button>
      </div>

      <style jsx>{`
        .song-detail-page {
          padding-bottom: 120px;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .detail-header {
           padding: var(--space-md) 0;
           display: flex;
        }

        .back-btn-premium {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn-premium:hover {
          background: var(--primary);
          border-color: var(--primary);
          transform: translateX(-4px);
        }

        .detail-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-xl);
        }

        @media (min-width: 1024px) {
          .detail-layout-grid {
            grid-template-columns: 400px 1fr;
            align-items: start;
          }
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
        }

        @media (max-width: 1023px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }

        .song-visual-container {
          position: relative;
          height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: var(--space-lg);
        }

        @media (min-width: 1024px) {
          .song-visual-container { height: 400px; }
        }

        .blurred-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: blur(40px) brightness(0.5);
          opacity: 0.6;
          transform: scale(1.1);
        }

        .sharp-img-hero {
          position: relative;
          z-index: 10;
          width: 200px;
          height: 200px;
          padding: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        @media (min-width: 1024px) {
          .sharp-img-hero { width: 300px; height: 300px; }
        }

        .hero-img-sharp {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .song-ident {
          text-align: center;
          margin-bottom: var(--space-lg);
        }

        .song-title-premium {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: var(--space-xs);
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .artist-chip {
          background: var(--primary-glow);
          color: var(--primary);
          border: 1px solid var(--primary);
          padding: 6px 18px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .artist-chip:hover {
          background: var(--primary);
          color: white;
        }

        .content-grid-internal {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .metadata-vertical {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .meta-card {
          display: flex;
          flex-direction: column;
          padding: var(--space-sm);
        }

        .meta-card.clickable {
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .meta-card.clickable:hover {
          background: rgba(255,255,255,0.05);
        }

        .m-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 1.5px;
          margin-bottom: 2px;
        }

        .m-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .lyrics-snippet-card {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .card-header {
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 2px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--primary);
        }

        .lyrics-content {
          font-size: 1.25rem;
          font-weight: 500;
          font-style: italic;
          line-height: 1.8;
          color: var(--text-main);
          border-left: 4px solid var(--primary);
          padding-left: var(--space-lg);
        }

        .trademark-note {
          font-size: 0.6rem;
          color: var(--text-dim);
          opacity: 0.5;
        }

        .action-row {
          margin-top: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .btn-spotify {
          background: #1DB954;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .btn-spotify:hover { transform: scale(1.02); }

        .btn-share {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .btn-share:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default SongDetail;
