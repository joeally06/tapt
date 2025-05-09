/*
  # Admin Management System

  1. New Tables
    - `board_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `title` (text)
      - `role` (text)
      - `organization` (text)
      - `location` (text)
      - `contact_info` (jsonb)
      - `image_url` (text)
      - `website` (text)
      - `notes` (text)
      - `term` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add policies for public read access
*/

-- Create board_members table
CREATE TABLE board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  role text,
  organization text,
  location text,
  contact_info jsonb,
  image_url text,
  website text,
  notes text,
  term text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" 
  ON board_members
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Allow admin full access" 
  ON board_members
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create updated_at trigger
CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();