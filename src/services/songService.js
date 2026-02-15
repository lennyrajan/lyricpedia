/**
 * Song Metadata Service (Mock)
 * This simulates the data discovered by the ingestion pipeline.
 */

import MOCK_SONGS from '../data/music-graph.json';

// In production, this would be your worker URL
// PASTE YOUR WORKER URL HERE (the same one you put in App.jsx)
const WORKER_URL = 'https://lyriverse-brain.YOUR_USERNAME.workers.dev';

async function fetchFromWorker(path, fallback) {
    try {
        const res = await fetch(`${WORKER_URL}${path}`);
        if (res.ok) return await res.json();
    } catch (e) {
        console.warn(`Worker API ${path} failed, using local fallback.`, e);
    }
    return fallback;
}

export const songService = {
    getTrending: async () => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.slice(0, 5);
    },

    getNewReleases: async (page = 0, limit = 10) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        const start = page * limit;
        return [...songs].reverse().slice(start, start + limit);
    },

    getSongById: async (id) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.find(s => s.id === id);
    },

    searchSongs: async (query) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        const q = query.toLowerCase();
        return songs.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        );
    },

    getArtistSongs: async (artistName) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.filter(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));
    },

    getAlbumSongs: async (albumName) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.filter(s => s.album?.toLowerCase() === albumName.toLowerCase());
    },

    getSongsByLanguage: async (lang) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.filter(s => s.language?.toLowerCase() === lang.toLowerCase());
    },

    getSongsByGenre: async (genre) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        return songs.filter(s => s.genre?.toLowerCase().includes(genre.toLowerCase()));
    },

    getArtistMeta: async (artistName) => {
        const songs = await fetchFromWorker('/api/songs', MOCK_SONGS);
        const firstSong = songs.find(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));
        return {
            name: artistName,
            image: firstSong?.image || '',
            bio: `Official Lyriverse entry for ${artistName}. Discovered via automated ingestion.`
        };
    }
};
