const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAuth, supabase } = require('../middleware/auth');

// Multer memory storage for parsing multipart/form-data before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route GET /api/gallery
 * @desc Fetch all active photos and gallery configuration (public)
 */
router.get('/', async (req, res) => {
  try {
    const { data: configData } = await supabase
      .from('gallery_settings')
      .select('value')
      .eq('key', 'gallery_columns')
      .single();
    
    const columns = configData?.value ? parseInt(configData.value, 10) : 3;

    const { data: images, error } = await supabase
      .from('photos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        console.warn("Gallery tables missing, returning sample images.");
        return res.json({ images: [], columns: 3 });
      }
      console.error("Error fetching photos", error);
      return res.json({ images: [], columns: 3 });
    }

    res.json({ images: images || [], columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gallery/upload
 * @desc Upload image to Cloudinary & insert into Supabase (Admin Only)
 */
router.post('/upload', verifyAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    // 1. Convert Buffer to Blob for fetch API
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    const formData = new FormData();
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append('file', blob, req.file.originalname);

    // 2. Upload to Cloudinary Unsigned endpoint
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryRes.ok) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
    }

    // 3. Transform URL to auto-format (useful for HEIC conversion)
    const originalUrl = cloudinaryData.secure_url;
    const uploadPathIndex = originalUrl.indexOf('/upload/') + 8;
    const webFriendlyUrl = originalUrl.slice(0, uploadPathIndex) + 'f_auto,q_auto/' + originalUrl.slice(uploadPathIndex);

    // 4. Save to Supabase database using the authenticated request client
    const { count, error: countErr } = await req.supabase.from('photos').select('*', { count: 'exact', head: true });
    
    const { data, error } = await req.supabase.from('photos').insert([{
      cloudinary_url: webFriendlyUrl,
      alt: req.file.originalname,
      display_order: (count || 0) + 1
    }]).select();

    if (error) throw new Error(error.message);

    res.json({ success: true, image: data[0] });
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/gallery/publish
 * @desc Update the sorting order and column count (Admin Only)
 */
router.post('/publish', verifyAuth, async (req, res) => {
  const { updates, columns } = req.body;

  try {
    if (updates && updates.length > 0) {
      const { error } = await req.supabase.from('photos').upsert(updates);
      if (error) throw new Error(error.message);
    }

    if (columns) {
      const { error: configError } = await req.supabase.from('gallery_settings').upsert({
        key: 'gallery_columns',
        value: columns.toString()
      });
      if (configError) throw new Error(configError.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Publish route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/gallery
 * @desc Delete an array of photos by ID (Admin Only)
 */
router.delete('/', verifyAuth, async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ error: 'No IDs provided to delete' });

  try {
    const { error } = await req.supabase.from('photos').delete().in('id', ids);
    if (error) throw new Error(error.message);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
