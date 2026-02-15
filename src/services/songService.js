/**
 * Song Metadata Service (Mock)
 * This simulates the data discovered by the ingestion pipeline.
 */

import MOCK_SONGS from '../data/music-graph.json';

export const songService = {
    getTrending: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_SONGS.slice(0, 5);
    },

    getNewReleases: async (page = 0, limit = 10) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const start = page * limit;
        return [...MOCK_SONGS].reverse().slice(start, start + limit);
    },

    getSongById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_SONGS.find(s => s.id === id);
    },

    searchSongs: async (query) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const q = query.toLowerCase();
        return MOCK_SONGS.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        );
    },

    getArtistSongs: async (artistName) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_SONGS.filter(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));
    },

    getAlbumSongs: async (albumName) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_SONGS.filter(s => s.album?.toLowerCase() === albumName.toLowerCase());
    },

    getSongsByLanguage: async (lang) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_SONGS.filter(s => s.language?.toLowerCase() === lang.toLowerCase());
    },

    getSongsByGenre: async (genre) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_SONGS.filter(s => s.genre?.toLowerCase().includes(genre.toLowerCase()));
    },

    getArtistMeta: async (artistName) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const firstSong = MOCK_SONGS.find(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));
        return {
            name: artistName,
            image: firstSong?.image || '',
            bio: `Official Lyriverse entry for ${artistName}. Discovered via automated ingestion.`
        };
    }
};
