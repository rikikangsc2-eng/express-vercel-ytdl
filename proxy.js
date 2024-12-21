const http = require('http');
const net = require('net');
const url = require('url');

// Membuat server proxy
const server = http.createServer((req, res) => {
    const targetUrl = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;

    console.log(`Request: ${targetUrl}`);

    const options = {
        headers: req.headers,
        method: req.method,
    };

    // Mengirim permintaan ke server target
    const proxyRequest = http.request(targetUrl, options, (proxyResponse) => {
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(res);
    });

    proxyRequest.on('error', (err) => {
        console.error(`Proxy error: ${err.message}`);
        res.writeHead(500);
        res.end('Internal Server Error');
    });

    req.pipe(proxyRequest);
});

// Menangani koneksi tunneling (HTTPS)
server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = new url.URL(`http://${req.url}`);
    const serverSocket = net.connect(port || 443, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error(`Tunneling error: ${err.message}`);
        clientSocket.end();
    });
});

// Menjalankan server pada port 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});