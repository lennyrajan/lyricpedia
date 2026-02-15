const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/index' && req.method === 'POST') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const scriptPath = path.join(__dirname, 'scripts', 'discovery-engine.js');
        const child = spawn('node', [scriptPath]);

        child.stdout.on('data', (data) => {
            res.write(`data: ${JSON.stringify({ type: 'log', message: data.toString() })}\n\n`);
        });

        child.stderr.on('data', (data) => {
            res.write(`data: ${JSON.stringify({ type: 'error', message: data.toString() })}\n\n`);
        });

        child.on('close', (code) => {
            res.write(`data: ${JSON.stringify({ type: 'done', code })}\n\n`);
            res.end();
        });

    } else if (req.url === '/api/report' && req.method === 'GET') {
        const reportPath = path.join(__dirname, 'src', 'data', 'admin-report.json');
        if (fs.existsSync(reportPath)) {
            const reportData = fs.readFileSync(reportPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(reportData);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Report not found' }));
        }
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Native Bridge running on http://localhost:${PORT}`);
});
