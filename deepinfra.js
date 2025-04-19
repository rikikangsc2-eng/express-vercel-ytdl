const https = require('https');

module.exports = (req, res) => {
    const options = {
        hostname: 'api.deepinfra.com',
        path: '/v1/openai/chat/completions',
        method: 'POST',
        headers: {
            ...req.headers,
        }
    };
    
    const proxyReq = https.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Ada error cuy: ${err.message}` }));
    });
    
    req.pipe(proxyReq);
};