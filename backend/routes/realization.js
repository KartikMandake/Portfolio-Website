const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAuth, supabase } = require('../middleware/auth');

// Multer memory storage for parsing multipart/form-data before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route GET /api/realization
 * @desc Fetch all cinematic frames for the realization moment (public)
 */
router.get('/', async (req, res) => {
  try {
    const { data: frames, error } = await supabase
      .from('realization_moments')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error("Error fetching realization frames:", error);
      return res.json({ frames: [] });
    }

    res.json({ frames: frames || [] });
  } catch (error) {
    console.error("Realization GET internal error:", error);
    res.json({ frames: [] });
  }
});

/**
 * @route POST /api/realization/upload
 * @desc Upload image to Cloudinary & insert into Supabase realization_moments (Admin Only)
 */
router.post('/upload', verifyAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    console.log('--- Upload Started ---');
    console.log('File:', req.file.originalname, req.file.mimetype, req.file.size);

    // 1. Convert Buffer to Blob for fetch API
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    const formData = new FormData();
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append('file', blob, req.file.originalname);

    // 2. Upload to Cloudinary Unsigned endpoint
    console.log('Uploading to Cloudinary...');
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryRes.ok) {
      console.error('Cloudinary Error:', cloudinaryData.error);
      throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
    }
    console.log('Cloudinary Success:', cloudinaryData.secure_url);

    // 3. Transform URL to auto-format
    const originalUrl = cloudinaryData.secure_url;
    const uploadPathIndex = originalUrl.indexOf('/upload/') + 8;
    const webFriendlyUrl = originalUrl.slice(0, uploadPathIndex) + 'f_auto,q_auto/' + originalUrl.slice(uploadPathIndex);

    // 4. Save to Supabase realization_moments
    console.log('Saving to Supabase...');
    const { count, error: countErr } = await req.supabase.from('realization_moments').select('*', { count: 'exact', head: true });
    if (countErr) console.warn('Supabase Count Warning:', countErr.message);

    const { data, error } = await req.supabase.from('realization_moments').insert([{
      cloudinary_url: webFriendlyUrl,
      alt: req.file.originalname,
      display_order: (count || 0) + 1
    }]).select();

    if (error) {
      console.error('Supabase Insert Error:', error.message);
      throw new Error(error.message);
    }

    console.log('Upload Complete Success');
    res.json({ success: true, frame: data?.[0] });
  } catch (err) {
    console.error('Realization upload error details:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/realization
 * @desc Delete an array of realization frames by ID (Admin Only)
 */
router.delete('/', verifyAuth, async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ error: 'No IDs provided to delete' });

  try {
    const { error } = await req.supabase.from('realization_moments').delete().in('id', ids);
    if (error) throw new Error(error.message);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Realization delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
