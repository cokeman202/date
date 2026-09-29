# 🍷 Palate & Passport — Food Travel Journal

A modern, elegant, and interactive web application to remember every memorable meal, explore ethnic world cuisines, and track visited cities on an interactive travel map with glowing administrative boundaries and pinpointed restaurant markers.

---

## ✨ Features

### 1. 📖 Food Travel Journal
- **Store every restaurant** you visit:
  - Restaurant Name with real-time autocomplete suggestions
  - City & Country with auto-detected coordinates and instant administrative boundary resolution
  - **Ethnic Cuisine** tag & flag (Chinese, Japanese, Italian, Ethiopian, Mexican, Thai, Greek, Indian, etc.)
  - Favorite dishes and highlight bites
  - Rating (1–5 stars) and Price level ($ – $$$$)
  - Story & visit notes
  - Photo upload with local/offline storage
  - Vibe tags (`#DinnerDate`, `#HiddenGem`, `#Buffet`, `#StreetFood`, etc.)
  - "Must Return" recommendation toggle
- **Fast Search & Smart Filters**:
  - Filter instantly by city, ethnic tradition, rating, or personal picks
  - Switch between **Polaroid Grid View** and **Compact Table View**

### 2. 🗺️ Cool City System & Glowing Travel Map
- **Interactive Map with Glowing Boundaries**:
  - Highlights true administrative city boundaries (e.g. Hamilton's 948-point perimeter) with vibrant dual-layer neon glow
  - **Pinpointed Restaurant Dots**: Shows individual restaurant markers with pulsing radar rings placed specifically at their street coordinates inside the glowing boundary
  - Click any city or restaurant to zoom in and inspect details
- **Passport Stamp Board**:
  - Retro, border-control style travel stamps for every visited city
  - Verified visit badges, entry numbers, and culinary stats

### 3. 🌍 Ethnic Cuisine Explorer
- Catalog of **32+ Global Culinary Traditions** spanning 9 world regions
- Unlocked cuisines glow with visit counts and highlight dishes
- Foodie Level progression from *Curious Palates 🌱* to *World Flavor Royalty 👑*

### 4. 🎲 Date Night Roulette
- Interactive spin wheel to decide where to eat tonight
- Filter by untried cuisines or top-rated favorites with celebratory confetti!

### 5. ✈️ Future Culinary Wishlist
- Bookmark dream restaurants and foodie spots with one-click conversion to your logged journal

---

## 🚀 Deployment to GitHub Pages

This project is configured for automated deployment to **GitHub Pages** using GitHub Actions:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<REPO-NAME>.git
   git push -u origin main
   ```
2. In your repository on GitHub:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** → **Source**, select **GitHub Actions**
3. The included workflow (`.github/workflows/deploy.yml`) will automatically build and publish your site!
4. Your website will be live at `https://<YOUR-USERNAME>.github.io/<REPO-NAME>/`.

---

## 💻 Running Locally

### Quick Start
```bash
npm start
```
Then open: **`http://localhost:3001`** in any browser.

### Development Mode
```bash
# Terminal 1: Backend API
node server/index.js

# Terminal 2: Frontend dev server
npm run dev
```
