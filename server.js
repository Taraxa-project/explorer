const config = require('config');
const { Appsignal } = require('@appsignal/nodejs');
const appsignal = new Appsignal(config.appsignal);

const { getRequestHandler } = require('@appsignal/nextjs');

const url = require('url');
const next = require('next');
const { createServer } = require('http');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = getRequestHandler(appsignal, app);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    return handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
