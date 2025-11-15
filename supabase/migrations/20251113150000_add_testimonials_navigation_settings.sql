-- Add navigation controls for testimonials carousel to homepage_sections_toggle
-- These settings allow enabling/disabling navigation arrows for mobile, tablet, and desktop

ALTER TABLE public.homepage_sections_toggle
ADD COLUMN IF NOT EXISTS testimonials_navigation_enabled_mobile boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS testimonials_navigation_enabled_tablet boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS testimonials_navigation_enabled_desktop boolean DEFAULT true;

COMMENT ON COLUMN public.homepage_sections_toggle.testimonials_navigation_enabled_mobile IS 'Enable/disable navigation arrows in testimonials carousel on mobile devices';
COMMENT ON COLUMN public.homepage_sections_toggle.testimonials_navigation_enabled_tablet IS 'Enable/disable navigation arrows in testimonials carousel on tablet devices';
COMMENT ON COLUMN public.homepage_sections_toggle.testimonials_navigation_enabled_desktop IS 'Enable/disable navigation arrows in testimonials carousel on desktop devices';

