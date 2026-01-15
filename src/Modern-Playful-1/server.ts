/**
 * RWM Puppet Master - Modern Playful Dashboard Server
 * Serves static files on port 3850
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3850;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    theme: 'Modern-Playful-1',
    port: PORT
  });
});

// Catch-all route for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('+-----------------------------------------------------------+');
  console.log('|                                                           |');
  console.log('|   Modern Playful Dashboard - RWM Puppet Master            |');
  console.log('|                                                           |');
  console.log(`|   Server running at: http://localhost:${PORT}               |`);
  console.log('|   Toggle dark/light mode with the theme button            |');
  console.log('|                                                           |');
  console.log('|   Press Ctrl+C to stop                                    |');
  console.log('|                                                           |');
  console.log('+-----------------------------------------------------------+');
  console.log('');
});
