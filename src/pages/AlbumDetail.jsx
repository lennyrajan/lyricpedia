import React, { useEffect, useState } from 'react';
import { songService } from '../services/songService';

const AlbumDetail = ({ albumName, onSongSelect, onBack }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [albumMeta, setAlbumMeta] = useState(null);

    useEffect(() => {
        const fetchAlbumData = async () => {
            const albumSongs = await songService.getAlbumSongs(albumName);
            setSongs(albumSongs);
            if (albumSongs.length > 0) {
                setAlbumMeta({
                    title: albumName,
                    artist: albumSongs[0].artist,
                    year: albumSongs[0].year,
                    image: albumSongs[0].image
                });
            }
            setLoading(false);
        };
        fetchAlbumData();
    }, [albumName]);

    if (loading) return <div className="loading-state">Loading Album Details...</div>;
    if (!albumMeta) return <div className="error-state">Album not found.</div>;

    return (
        <div className="album-detail-page">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="album-hero glass-panel">
                <img src={albumMeta.image} alt={albumMeta.title} className="album-art" />
                <div className="album-info">
                    <span className="album-label">Album</span>
                    <h1 className="album-title-text">{albumMeta.title}</h1>
                    <p className="album-artist-text">{albumMeta.artist} • {albumMeta.year}</p>
                </div>
            </div>

            <div className="tracklist">
                <h2 className="section-title">Tracklist</h2>
                <div className="grid-layout">
                    {songs.map((song, index) => (
                        <div key={song.id} className="song-row glass-panel" onClick={() => onSongSelect(song)}>
                            <div className="track-number">{index + 1}</div>
                            <div className="song-info">
                                <div className="row-title">{song.title}</div>
                                <div className="row-meta">{song.language}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .album-detail-page {
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

        .album-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-xl);
          text-align: center;
          margin-bottom: var(--space-xl);
          gap: var(--space-lg);
        }

        .album-art {
          width: 200px;
          height: 200px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .album-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--primary);
          font-weight: 700;
        }

        .album-title-text {
          font-size: 2.5rem;
          margin: var(--space-xs) 0;
        }

        .album-artist-text {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .tracklist {
          margin-top: var(--space-lg);
        }

        .track-number {
          width: 24px;
          color: var(--text-dim);
          font-weight: 700;
          text-align: center;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default AlbumDetail;
