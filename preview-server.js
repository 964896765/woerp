const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'unpackage', 'dist', 'dev', 'h5');
const port = process.env.PORT || 5173;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    } else {
      // fallback to index.html for SPA routes
      const fallback = path.join(root, 'index.html');
      fs.createReadStream(fallback).pipe(res);
    }
  });
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}/`);
  console.log(`Serving: ${root}`);
});