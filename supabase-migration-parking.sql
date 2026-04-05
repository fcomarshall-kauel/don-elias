-- ============================================================
-- Migration: Parking spots + vehicle plates in visits
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Add vehicle fields to visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS vehicle_plate text;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS parking_spot text;

-- Parking spots table
CREATE TABLE parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  spot_type text DEFAULT 'visita' CHECK (spot_type IN ('visita', 'residente', 'otro')),
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0
);

ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON parking_spots FOR ALL USING (true) WITH CHECK (true);

-- Default parking spots
INSERT INTO parking_spots (name, spot_type, sort_order) VALUES
  ('Visita 1', 'visita', 1),
  ('Visita 2', 'visita', 2),
  ('Visita 3', 'visita', 3),
  ('Visita 4', 'visita', 4),
  ('Visita 5', 'visita', 5);
