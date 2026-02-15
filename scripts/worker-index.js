/**
 * Lyriverse Cloud Discovery Worker
 * 
 * Runs on Cloudflare Workers. 
 * - Scheduled (Cron): Every 6 hours to refresh trends.
 * - HTTP (Trigger): For manual admin invocations.
 */

export default {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(runDiscovery(env));
    },

    async fetch(request, env, ctx) {
        // CORS Headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        try {
            const url = new URL(request.url);

            if (request.method === "OPTIONS") {
                return new Response(null, { headers: corsHeaders });
            }

            // GET: Fetch current index
            if (url.pathname === "/api/songs" && request.method === "GET") {
                const data = await env.LYRI_DATA.get("music-graph", "json");
                return new Response(JSON.stringify(data || []), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // GET: Fetch admin report
            if (url.pathname === "/api/report" && request.method === "GET") {
                const report = await env.LYRI_DATA.get("admin-report", "json");
                return new Response(JSON.stringify(report || {}), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // POST: Manual Trigger (Admin Only)
            if (url.pathname === "/api/index" && request.method === "POST") {
                // In a real app, verify admin auth here
                ctx.waitUntil(runDiscovery(env));
                return new Response(JSON.stringify({ message: "Discovery process initiated in background." }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // Final Fallback: Always return with CORS
            return new Response(JSON.stringify({ error: "Endpoint not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
    }
};

async function runDiscovery(env) {
    const startTime = Date.now();
    console.log("🚀 UNIVERSAL INDEXER ACTIVE: Syncing Global Music Graph...");

    try {
        // 1. Live Trend Multiplex (UK & Global Base)
        const trendingSongs = [];
        try {
            const res = await fetch('https://www.officialcharts.com/charts/singles-chart/');
            const html = await res.text();
            const entryRegex = /<div class="chart-name">[\s\S]*?<span>(.*?)<\/span>[\s\S]*?<div class="chart-artist">[\s\S]*?<span>(.*?)<\/span>/g;
            let match;
            while ((match = entryRegex.exec(html)) !== null && trendingSongs.length < 30) {
                trendingSongs.push({
                    title: match[1].trim(),
                    artist: match[2].trim(),
                    lang: "English",
                    genre: "Pop/Charts"
                });
            }
        } catch (e) {
            console.error("Trend scrape failed, using seed only.");
        }

        // 2. UNIVERSAL SEED LIBRARY (Classic & Regional Legends)
        // A massive core for the "One-Stop Shop" vision.
        const universalSeed = [
            // Indian Core (Tamil, Telugu, Malayalam, Hindi, Kannada, Punjabi)
            { title: "Kaavalaa", artist: "Anirudh Ravichander", lang: "Tamil", genre: "Kollywood" },
            { title: "Hukum", artist: "Anirudh Ravichander", lang: "Tamil", genre: "Kollywood" },
            { title: "Enna Solla", artist: "Anirudh Ravichander", lang: "Tamil", genre: "Kollywood" },
            { title: "Naa Ready", artist: "Anirudh Ravichander", lang: "Tamil", genre: "Kollywood" },
            { title: "Malabari Banger", artist: "M.H.R", lang: "Malayalam", genre: "Regional" },
            { title: "Pala Palli", artist: "Atul Narukara", lang: "Malayalam", genre: "Folk" },
            { title: "Kalaavathi", artist: "Thaman S", lang: "Telugu", genre: "Tollywood" },
            { title: "Buttabomma", artist: "Thaman S", lang: "Telugu", genre: "Tollywood" },
            { title: "Ra Ra Rakkamma", artist: "Nakash Aziz", lang: "Kannada", genre: "Sandalwood" },
            { title: "Kesariya", artist: "Arijit Singh", lang: "Hindi", genre: "Bollywood" },
            { title: "Tum Hi Ho", artist: "Arijit Singh", lang: "Hindi", genre: "Bollywood" },
            { title: "Pasoori", artist: "Ali Sethi", lang: "Punjabi", genre: "Global" },

            // East Asia (Korean, Japanese)
            { title: "Seven", artist: "Jung Kook", lang: "Korean", genre: "K-Pop" },
            { title: "Ditto", artist: "NewJeans", lang: "Korean", genre: "K-Pop" },
            { title: "Idol", artist: "YOASOBI", lang: "Japanese", genre: "J-Pop" },

            // European & Middle East (Spanish, German, Polish, French, Arabic)
            { title: "Despacito", artist: "Luis Fonsi", lang: "Spanish", genre: "Latin" },
            { title: "BZRP Sessions #53", artist: "Shakira", lang: "Spanish", genre: "Latin" },
            { title: "Dernière danse", artist: "Indila", lang: "French", genre: "Pop" },
            { title: "Sie weiß", artist: "Ayliva", lang: "German", genre: "Pop" },
            { title: "Sommer am Kiez", artist: "Ski Aggu", lang: "German", genre: "Rap" },
            { title: "Tamagotchi", artist: "Mata", lang: "Polish", genre: "Rap" },
            { title: "3 Daqat", artist: "Abu", lang: "Arabic", genre: "Pop" },

            // Global Legends
            { title: "Starboy", artist: "The Weeknd", lang: "English", genre: "Pop" },
            { title: "Blinding Lights", artist: "The Weeknd", lang: "English", genre: "Pop" },
            { title: "Bohemian Rhapsody", artist: "Queen", lang: "English", genre: "Rock" },
            { title: "Imagine", artist: "John Lennon", lang: "English", genre: "Classic" }
        ];

        // Merge and Deduplicate
        const mergedLibrary = [...trendingSongs, ...universalSeed];
        const uniqueSongs = Array.from(new Set(mergedLibrary.map(s => `${s.title}|${s.artist}`)))
            .map(id => mergedLibrary.find(s => `${s.title}|${s.artist}` === id));

        // 3. Pro Enrichment: Real-time Lyric Extraction Simulation
        const enrichedSongs = uniqueSongs.map((s, i) => {
            const hash = s.title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);

            const snippets = [
                "Walking through the city with the lights down low...",
                "The echo of your name still rings in the hall.",
                "Diamond heart but a soul made of porcelain.",
                "We were giants once, before the tide rolled in.",
                "Nee vandhu ninnaporthu... (Tamil Soul)",
                "Kesariya tera ishq hai piya... (Hindi Classic)",
                "Maname... (Malayalam Echo)",
                "Quiero respirar tu cuello despacito... (Spanish Heat)",
                "Ich will nur, dass du weißt... (German Pop)",
                "Fast cars and slow nights in the valley."
            ];

            return {
                id: `uni-${Date.now()}-${i}`,
                title: s.title,
                artist: s.artist,
                album: s.lang === "English" ? "Global Archive" : `${s.lang} Essentials`,
                year: 2026,
                language: s.lang,
                genre: s.genre,
                popularity: 100 - (i % 50),
                snippet: snippets[Math.abs(hash) % snippets.length],
                image: `https://picsum.photos/seed/${encodeURIComponent(s.title + s.artist)}/600/600`
            };
        });

        // 4. Update the Cloud Knowledge Graph
        await env.LYRI_DATA.put("music-graph", JSON.stringify(enrichedSongs));

        const stats = {
            scanned: trendingSongs.length,
            universal_seed: universalSeed.length,
            total_indexed: enrichedSongs.length,
            languages: [...new Set(enrichedSongs.map(s => s.language))].join(", "),
            timestamp: new Date().toISOString()
        };
        await env.LYRI_DATA.put("admin-report", JSON.stringify(stats));

        console.log("🌍 UNIVERSAL GRAPH UPDATED. One-Stop Shop Active.");
    } catch (err) {
        console.error("Discovery Error:", err.message);
    }
}
