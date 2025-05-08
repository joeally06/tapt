/*
  # Conference Registration System

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `conference_id` (uuid, references conferences)
      - `status` (enum: pending, confirmed, cancelled)
      - `payment_status` (enum: pending, paid, refunded)
      - `amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conferences`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `location` (text)
      - `description` (text)
      - `price` (numeric)
      - `max_attendees` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own registrations
    - Add policies for admin users to manage all data
*/

-- Create enum types
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Create conferences table
CREATE TABLE conferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  max_attendees integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  conference_id uuid REFERENCES conferences NOT NULL,
  status registration_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policies for conferences
CREATE POLICY "Conferences are viewable by everyone"
  ON conferences
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert conferences"
  ON conferences
  FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update conferences"
  ON conferences
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for registrations
CREATE POLICY "Users can view their own registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();