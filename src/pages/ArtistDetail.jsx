import React, { useEffect, useState } from 'react';
import { songService } from '../services/songService';

const ArtistDetail = ({ artistName, onSongSelect, onBack }) => {
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            const [meta, artistSongs] = await Promise.all([
                songService.getArtistMeta(artistName),
                songService.getArtistSongs(artistName)
            ]);
            setArtist(meta);
            setSongs(artistSongs);
            setLoading(false);
        };
        fetchArtistData();
    }, [artistName]);

    if (loading) return <div className="loading-state">Loading Artist Profile...</div>;

    return (
        <div className="artist-detail-page">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="artist-header">
                <div className="artist-profile-img-container">
                    <img src={artist.image} alt={artist.name} className="artist-profile-img" />
                </div>
                <div className="artist-identity">
                    <h1 className="artist-name-title">{artist.name}</h1>
                    <p className="artist-bio">{artist.bio}</p>
                </div>
            </div>

            <section className="discography">
                <h2 className="section-title">Discography</h2>
                <div className="grid-layout">
                    {songs.map(song => (
                        <div key={song.id} className="song-row glass-panel" onClick={() => onSongSelect(song)}>
                            <img src={song.image} alt={song.title} className="row-thumb" />
                            <div className="song-info">
                                <div className="row-title">{song.title}</div>
                                <div className="row-meta">{song.album} • {song.year}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .artist-detail-page {
          padding-bottom: var(--space-xl);
          animation: fadeIn 0.3s ease-out;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          padding: var(--space-md) 0;
          cursor: pointer;
        }

        .artist-header {
          display: flex;
          gap: var(--space-lg);
          align-items: center;
          margin-bottom: var(--space-xl);
          padding: var(--space-md);
          background: var(--bg-card);
          border-radius: 20px;
        }

        .artist-profile-img-container {
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--primary);
        }

        .artist-profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .artist-identity {
          flex: 1;
        }

        .artist-name-title {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
        }

        .artist-bio {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .discography {
           margin-top: var(--space-lg);
        }

        .loading-state {
          padding: var(--space-xl);
          text-align: center;
          color: var(--text-muted);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default ArtistDetail;
