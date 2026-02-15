import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../src/data/music-graph.json');
const DATA_DIR = path.dirname(DATA_PATH);

const REPORT_PATH = path.join(__dirname, '../src/data/admin-report.json');

/**
 * Lyriverse Discovery Engine (Pro Version)
 * Scrapes top hits and attempts to fetch real lyrics snippets for each.
 */
async function runDiscovery() {
    console.log('🚀 Starting Lyriverse Professional Discovery Engine...');
    const startTime = Date.now();

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const stats = {
        scanned: 0,
        enriched: 0,
        failed: 0,
        startTime: new Date().toISOString()
    };

    try {
        // 1. Fetch Trending Singles (Official Charts)
        console.log('📡 Fetching trends from Official Charts...');
        const chartsResponse = await axios.get('https://www.officialcharts.com/charts/singles-chart/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(chartsResponse.data);

        const trendingSongs = [];
        const entries = $('.chart-item').length > 0 ? $('.chart-item') : $('.chart-results-list .chart-row');

        entries.each((i, el) => {
            if (i >= 50) return; // Increased to Top 50

            const title = $(el).find('.chart-name span').first().text().trim() || $(el).find('.chart-name').text().trim();
            const artist = $(el).find('.chart-artist span').first().text().trim() || $(el).find('.chart-artist').text().trim();
            const image = $(el).find('img').attr('src') || '';

            if (title && artist) {
                trendingSongs.push({
                    title,
                    artist,
                    image: image.startsWith('http') ? image : `https://www.officialcharts.com${image}`,
                    source: 'Official Charts'
                });
            }
        });

        stats.scanned = trendingSongs.length;
        console.log(`✅ Identified ${trendingSongs.length} trending tracks.`);

        // 2. Enrich with Lyrics Snippets
        const enrichedSongs = [];
        for (const song of trendingSongs) {
            process.stdout.write(`🔍 [${enrichedSongs.length + 1}/${trendingSongs.length}] Indexing: ${song.title}... `);
            try {
                const snippetSearch = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(song.title + ' ' + song.artist + ' lyrics')}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 5000
                });
                const $snippet = cheerio.load(snippetSearch.data);

                let snippet = $snippet('div.VwiC3b').first().text().trim();
                if (!snippet || snippet.length < 10) {
                    snippet = `Looking for lyrics for ${song.title}... Thematic extraction in progress.`;
                } else {
                    snippet = snippet.split('.')[0] + (snippet.split('.')[1] ? '.' + snippet.split('.')[1] + '.' : '.');
                }

                let highResImage = song.image;
                if (highResImage.includes('80x80bb.jpg')) {
                    highResImage = highResImage.replace('80x80bb.jpg', '600x600bb.jpg');
                } else if (highResImage.includes('100x100')) {
                    highResImage = highResImage.replace('100x100', '600x600');
                }

                enrichedSongs.push({
                    id: `song-${Date.now()}-${enrichedSongs.length}`,
                    title: song.title,
                    artist: song.artist,
                    album: "Current Hits",
                    year: 2026,
                    language: 'English',
                    genre: 'Pop',
                    popularity: 100 - enrichedSongs.length,
                    snippet: snippet,
                    image: highResImage
                });

                stats.enriched++;
                console.log('OK');
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.log('FAIL');
                stats.failed++;
                enrichedSongs.push({
                    ...song,
                    id: `song-${Date.now()}-${enrichedSongs.length}`,
                    snippet: "Lyrics discovered. Snippet indexing delayed."
                });
            }
        }

        // 3. Persist Data
        fs.writeFileSync(DATA_PATH, JSON.stringify(enrichedSongs, null, 2));

        // 4. Generate Admin Report
        const duration = (Date.now() - startTime) / 1000;
        stats.endTime = new Date().toISOString();
        stats.durationSeconds = duration;
        stats.totalInIndex = enrichedSongs.length;

        fs.writeFileSync(REPORT_PATH, JSON.stringify(stats, null, 2));

        console.log(`\n💎 Index updated: ${enrichedSongs.length} songs.`);
        console.log(`📊 Report saved: ${REPORT_PATH}`);

    } catch (error) {
        console.error('\n❌ Discovery Engine CRITICAL Error:', error.message);
    }
}

runDiscovery();
