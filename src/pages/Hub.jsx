import React, { useEffect, useState } from 'react';
import { songService } from '../services/songService';

const Hub = ({ type, value, onSongSelect, onBack }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            let results = [];
            if (type === 'language') {
                results = await songService.getSongsByLanguage(value);
            } else if (type === 'genre') {
                results = await songService.getSongsByGenre(value);
            }
            setSongs(results);
            setLoading(false);
        };
        fetchData();
    }, [type, value]);

    if (loading) return <div className="loading-state">Exploring {value}...</div>;

    return (
        <div className="hub-page">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="hub-header">
                <span className="hub-type">{type}</span>
                <h1 className="hub-title">{value} Hub</h1>
            </div>

            <div className="results-count">
                {songs.length} song{songs.length !== 1 ? 's' : ''} indexed
            </div>

            <div className="grid-layout">
                {songs.map(song => (
                    <div key={song.id} className="song-row glass-panel" onClick={() => onSongSelect(song)}>
                        <img src={song.image} alt={song.title} className="row-thumb" />
                        <div className="song-info">
                            <div className="row-title">{song.title}</div>
                            <div className="row-meta">{song.artist} • {song.album}</div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .hub-page {
          padding-bottom: var(--space-xl);
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          padding: var(--space-md) 0;
          cursor: pointer;
        }

        .hub-header {
          margin-bottom: var(--space-lg);
          padding: var(--space-lg);
          border-radius: 20px;
          background: linear-gradient(135deg, var(--primary-glow), transparent);
          border-left: 4px solid var(--primary);
        }

        .hub-type {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--primary);
          font-weight: 700;
        }

        .hub-title {
          font-size: 2.25rem;
          margin-top: 4px;
        }

        .results-count {
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: var(--space-md);
          padding-left: var(--space-sm);
        }
      `}</style>
        </div>
    );
};

export default Hub;
