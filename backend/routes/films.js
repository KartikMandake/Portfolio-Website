const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAuth, supabase } = require('../middleware/auth');

// Multer memory storage for parsing multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route GET /api/films
 * @desc Fetch all active films
 */
router.get('/', async (req, res) => {
  try {
    const { data: films, error } = await supabase
      .from('films')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      // If table doesn't exist yet, we fall back to empty to not break frontend
      console.error("Error fetching films:", error);
      return res.json({ films: [] });
    }

    res.json({ films: films || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/films/upload
 * @desc Upload video to Cloudinary & insert into Supabase (Admin Only)
 */
router.post('/upload', verifyAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file provided' });

  const { alt } = req.body;

  try {
    // 1. Convert Buffer to Blob for fetch API
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    const formData = new FormData();
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append('file', blob, req.file.originalname);

    // 2. Upload to Cloudinary Unsigned endpoint (video resource type)
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`, {
      method: 'POST',
      body: formData
    });
    
    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryRes.ok) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary video upload failed');
    }

    const originalUrl = cloudinaryData.secure_url;
    const uploadPathIndex = originalUrl.indexOf('/upload/') + 8;
    const videoUrl = originalUrl.slice(0, uploadPathIndex) + 'f_auto,q_auto/' + originalUrl.slice(uploadPathIndex);

    // 3. Save to Supabase database using the authenticated request client
    const { count, error: countErr } = await req.supabase.from('films').select('*', { count: 'exact', head: true });
    
    const { data, error } = await req.supabase.from('films').insert([{
      video_url: videoUrl,
      alt: alt || req.file.originalname,
      display_order: (count || 0) + 1
    }]).select();

    if (error) throw new Error(error.message);

    res.json({ success: true, film: data[0] });
  } catch (err) {
    console.error('Upload video route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/films
 * @desc Add a new film via URL (Admin Only)
 */
router.post('/', verifyAuth, async (req, res) => {
  const { video_url, thumbnail_url, alt } = req.body;
  if (!video_url) return res.status(400).json({ error: 'No video URL provided' });

  try {
    const { count, error: countErr } = await req.supabase.from('films').select('*', { count: 'exact', head: true });
    
    const { data, error } = await req.supabase.from('films').insert([{
      video_url,
      thumbnail_url,
      alt,
      display_order: (count || 0) + 1
    }]).select();

    if (error) throw new Error(error.message);

    res.json({ success: true, film: data[0] });
  } catch (err) {
    console.error('Add film route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/films/publish
 * @desc Update the sorting order (Admin Only)
 */
router.post('/publish', verifyAuth, async (req, res) => {
  const { updates } = req.body;

  try {
    if (updates && updates.length > 0) {
      const { error } = await req.supabase.from('films').upsert(updates);
      if (error) throw new Error(error.message);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Publish film route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/films
 * @desc Delete an array of films by ID (Admin Only)
 */
router.delete('/', verifyAuth, async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ error: 'No IDs provided to delete' });

  try {
    const { error } = await req.supabase.from('films').delete().in('id', ids);
    if (error) throw new Error(error.message);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
