import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { geocodeCity } from './geocode.js';
import { getCityBoundary } from './boundaries.js';
import { searchPlaces, searchCities } from './search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const DATA_DIR = path.join(rootDir, 'data');
const UPLOADS_DIR = path.join(rootDir, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'journal.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      restaurants: [],
      wishlist: [],
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB, resetting to clean slate', e);
    return {
      restaurants: [],
      wishlist: []
    };
  }
}

function saveDb(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Image upload endpoint
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  const db = loadDb();
  res.json(db.restaurants || []);
});

// Add new restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const db = loadDb();
    const entry = req.body;
    entry.id = 'rest-' + Date.now();

    // Auto geocode if lat/lng is missing
    if (!entry.lat || !entry.lng) {
      const geo = await geocodeCity(entry.city);
      if (geo) {
        entry.lat = geo.lat;
        entry.lng = geo.lng;
        if (!entry.country && geo.country) {
          entry.country = geo.country;
        }
      }
    }

    db.restaurants = [entry, ...(db.restaurants || [])];
    saveDb(db);

    // Asynchronously pre-fetch boundary so it's cached
    if (entry.city) {
      getCityBoundary(entry.city, { lat: entry.lat, lng: entry.lng }).catch(() => {});
    }

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant
app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const db = loadDb();
    const id = req.params.id;
    const index = db.restaurants.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const updated = { ...db.restaurants[index], ...req.body };

    if (req.body.city && req.body.city !== db.restaurants[index].city) {
      const geo = await geocodeCity(req.body.city);
      if (geo) {
        updated.lat = geo.lat;
        updated.lng = geo.lng;
        if (geo.country) updated.country = geo.country;
      }
    }

    db.restaurants[index] = updated;
    saveDb(db);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete restaurant
app.delete('/api/restaurants/:id', (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  db.restaurants = (db.restaurants || []).filter(r => r.id !== id);
  saveDb(db);
  res.json({ success: true, id });
});

// City boundary endpoint for Leaflet glow effect
app.get('/api/boundary', async (req, res) => {
  const city = req.query.city;
  const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const boundary = await getCityBoundary(city, { lat, lng });
  if (boundary) {
    res.json(boundary);
  } else {
    res.status(404).json({ error: 'Boundary not found' });
  }
});

// Autocomplete endpoint for restaurants & eateries
app.get('/api/search-places', async (req, res) => {
  const query = req.query.q;
  const city = req.query.city;
  const results = await searchPlaces(query, city);
  res.json(results);
});

// Autocomplete endpoint for cities
app.get('/api/search-cities', async (req, res) => {
  const query = req.query.q;
  const results = await searchCities(query);
  res.json(results);
});

// Get wishlist
app.get('/api/wishlist', (req, res) => {
  const db = loadDb();
  res.json(db.wishlist || []);
});

// Add to wishlist
app.post('/api/wishlist', (req, res) => {
  const db = loadDb();
  const item = { ...req.body, id: 'wish-' + Date.now() };
  db.wishlist = [item, ...(db.wishlist || [])];
  saveDb(db);
  res.status(201).json(item);
});

// Delete from wishlist
app.delete('/api/wishlist/:id', (req, res) => {
  const db = loadDb();
  db.wishlist = (db.wishlist || []).filter(w => w.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Geocode helper API
app.get('/api/geocode', async (req, res) => {
  const city = req.query.city;
  const result = await geocodeCity(city);
  res.json(result || { lat: 40.7128, lng: -74.0060 });
});

// Export full backup
app.get('/api/export', (req, res) => {
  const db = loadDb();
  res.setHeader('Content-Disposition', 'attachment; filename="food-passport-backup.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

// Import backup
app.post('/api/import', (req, res) => {
  if (!req.body || !Array.isArray(req.body.restaurants)) {
    return res.status(400).json({ error: 'Invalid backup format' });
  }
  const db = {
    restaurants: req.body.restaurants || [],
    wishlist: req.body.wishlist || [],
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  res.json({ success: true, count: db.restaurants.length });
});

// Reset data to empty clean slate
app.post('/api/clear-all', (req, res) => {
  const empty = {
    restaurants: [],
    wishlist: [],
    updatedAt: new Date().toISOString()
  };
  saveDb(empty);
  res.json(empty);
});

// Serve static production build if it exists
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  Palate & Passport server running!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
