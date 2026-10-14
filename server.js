import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// If dist directory exists, serve static assets
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: send index.html for any unmatched route
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Application build not found. Please run "npm run build" or "yarn build" first.');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aura Bank production server listening on http://0.0.0.0:${PORT}`);
});
