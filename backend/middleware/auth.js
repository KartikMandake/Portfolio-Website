const { createClient } = require('@supabase/supabase-js');

// Create a basic Supabase client for auth verification
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token', details: error });
    }

    req.user = user;
    
    // Create a request-specific authenticated client so RLS policies succeed
    req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { verifyAuth, supabase };
