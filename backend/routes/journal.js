const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAuth, supabase } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route GET /api/journal
 * @desc Fetch all journal entries
 */
router.get('/', async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching journal entries:", error);
      return res.json({ entries: [] });
    }

    res.json({ entries: entries || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/journal
 * @desc Add a new journal entry (Admin Only)
 */
router.post('/', verifyAuth, upload.single('file'), async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  let imageUrl = null;

  try {
    if (req.file) {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
      formData.append('file', blob, req.file.originalname);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');

      const originalUrl = cloudinaryData.secure_url;
      const uploadPathIndex = originalUrl.indexOf('/upload/') + 8;
      imageUrl = originalUrl.slice(0, uploadPathIndex) + 'f_auto,q_auto/' + originalUrl.slice(uploadPathIndex);
    }

    const { data, error } = await req.supabase.from('journal_entries').insert([{
      title,
      content,
      image_url: imageUrl
    }]).select();

    if (error) throw new Error(error.message);

    res.json({ success: true, entry: data[0] });
  } catch (err) {
    console.error('Add journal entry route error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/journal/:id
 * @desc Delete a journal entry by ID (Admin Only)
 */
router.delete('/:id', verifyAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await req.supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw new Error(error.message);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete journal error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
