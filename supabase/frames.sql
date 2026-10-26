-- Phase E2: deck pages / video keyframes rendered as PNGs for visual analysis.
-- Run in the Supabase SQL Editor (same pattern as analyses.sql).
-- The pipeline works without these columns — frames just won't persist or reach Claude.

alter table uploads add column if not exists frame_paths jsonb;
alter table uploads add column if not exists frame_count int;
alter table uploads add column if not exists frame_kind text; -- 'pages' | 'keyframes'
