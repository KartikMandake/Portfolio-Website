require('dotenv').config();
const express = require('express');
const cors = require('cors');
const galleryRoutes = require('./routes/gallery');
const filmsRoutes = require('./routes/films');
const journalRoutes = require('./routes/journal');
const aboutRoutes = require('./routes/about');
const realizationRoutes = require('./routes/realization');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/films', filmsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/realization', realizationRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('Portfolio Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
