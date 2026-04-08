const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const [resources] = await db.execute(`
      SELECT r.*, u.username, u.profile_pic_url
      FROM resources r 
      JOIN users u ON r.uploaded_by = u.id 
      ORDER BY r.created_at DESC
    `);
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a resource with file upload
router.post('/', auth, upload.single('document'), async (req, res) => {
  try {
    const { title } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const filePath = '/uploads/' + req.file.filename;

    const [result] = await db.execute(
      'INSERT INTO resources (uploaded_by, title, file_name, file_path) VALUES (?, ?, ?, ?)',
      [req.user.user.id, title, req.file.originalname, filePath]
    );

    res.status(201).json({ id: result.insertId, uploaded_by: req.user.user.id, title, file_name: req.file.originalname, file_path: filePath });
  } catch (err) {
    if (err.message === 'File type not supported') {
      return res.status(400).json({ error: 'File type not supported' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('connect'))) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    // Specific check for MySQL Insert/Execute failure
    if (err.sqlMessage || err.sqlState) {
       console.error('Database insertion error:', err);
       return res.status(500).json({ error: 'Database insertion failed' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
