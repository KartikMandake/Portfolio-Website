-- SQL Commands to Create Tables for the Cinematic Portfolio

-- 1. Films Table
CREATE TABLE public.films (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url text NOT NULL,
    thumbnail_url text, -- For YouTube/Vimeo Custom Thumbnails
    alt text,           -- Title or Description
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and create public view policy
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.films FOR SELECT
TO public
USING (true);

-- 2. Journal Table
CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    image_url text, 
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and create public view policy
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.journal_entries FOR SELECT
TO public
USING (true);

-- 3. About Config Table
CREATE TABLE public.about_content (
    id integer PRIMARY KEY DEFAULT 1,
    greeting text,
    paragraph1 text,
    paragraph2 text,
    image_url text,
    name text,
    email text,
    phone text,
    instagram text,
    behance text,
    twitter text
);

-- Enable RLS and create public view policy
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.about_content FOR SELECT
TO public
USING (true);

-- Insert Default Row for About
INSERT INTO public.about_content (id, greeting, paragraph1, paragraph2, image_url, name, email, phone, instagram, behance, twitter) 
VALUES (1, 'About the Artist', 'Hey there! I am a passionate photographer exploring the world one frame at a time.', 'I believe that every face, every landscape, and every shadow holds a narrative waiting to be unraveled.', '/herobackground.png', 'Kartik', 'hello@example.com', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 4. Realization Moments Table
CREATE TABLE IF NOT EXISTS public.realization_moments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cloudinary_url text NOT NULL,
    alt text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and create public view policy
ALTER TABLE public.realization_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.realization_moments FOR SELECT
TO public
USING (true);

-- 5. Photos (Gallery) Table
CREATE TABLE IF NOT EXISTS public.photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cloudinary_url text NOT NULL,
    alt text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and create public view policy
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.photos FOR SELECT
TO public
USING (true);

-- 6. Gallery Settings Table
CREATE TABLE IF NOT EXISTS public.gallery_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and create public view policy
ALTER TABLE public.gallery_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.gallery_settings FOR SELECT
TO public
USING (true);

-- Insert default gallery columns
INSERT INTO public.gallery_settings (key, value)
VALUES ('gallery_columns', '3')
ON CONFLICT (key) DO NOTHING;
