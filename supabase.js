import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lnjuijbaoqepiqbgouac.supabase.co';

const SUPABASE_KEY = 'sb_publishable_xQGwY6cJ2YJh7fuy2-vdbQ_5B8BPvvs';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);