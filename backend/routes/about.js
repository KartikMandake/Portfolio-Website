const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAuth, supabase } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route GET /api/about
 * @desc Fetch the single about content
 */
router.get('/', async (req, res) => {
  try {
    const { data: about, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is multiple/no rows
      console.error("Error fetching about content:", error);
    }

    res.json({ about: about || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/about
 * @desc Update the about content (Admin Only)
 */
router.put('/', verifyAuth, upload.single('file'), async (req, res) => {
  const { greeting, paragraph1, paragraph2, current_image_url, name, email, phone, instagram, behance, twitter } = req.body;
  let imageUrl = current_image_url;

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

    const updates = {
      id: 1, // enforce singleton
      greeting: greeting || 'About the Artist',
      paragraph1: paragraph1 || '',
      paragraph2: paragraph2 || '',
      image_url: imageUrl || '',
      name: name || '',
      email: email || '',
      phone: phone || '',
      instagram: instagram || '',
      behance: behance || '',
      twitter: twitter || ''
    };

    const { data, error } = await req.supabase.from('about_content').upsert(updates).select();

    if (error) throw new Error(error.message);

    res.json({ success: true, about: data[0] });
  } catch (err) {
    console.error('Update about route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
