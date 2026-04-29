require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const resourcesRoutes = require('./routes/resources');
const profileRoutes = require('./routes/profile');
const commentsRoutes = require('./routes/comments');
const likesRoutes = require('./routes/likes');
const adminRoutes = require('./routes/admin');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/users/profile', profileRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check and placeholder for API
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to UniConnect API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep event loop alive
setInterval(() => {}, 1000 * 60 * 60);
