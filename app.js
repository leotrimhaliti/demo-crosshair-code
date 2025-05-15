import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseEvent, parseTicks } from '@laihoe/demoparser2';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public')); // serve static files (your HTML, CSS, JS)
app.use(express.json());

app.post('/upload', upload.single('demo_file'), (req, res) => {
  const demoPath = req.file.path;

  try {
    const roundEndEvents = parseEvent(demoPath, 'round_end');
    if (!roundEndEvents.length) {
      return res.status(400).json({ error: 'No round_end events found. Invalid demo?' });
    }
    const lastTick = Math.max(...roundEndEvents.map(e => e.tick));
    const players = parseTicks(demoPath, ['crosshair_code', 'name', 'steamid'], [lastTick]);

    fs.unlink(demoPath, (err) => {
      if (err) console.error('Failed to delete uploaded demo:', err);
    });

    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: `Failed to parse demo: ${err.message}` });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
