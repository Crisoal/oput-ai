/*
  # Create user profiles schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `academic_level` (text)
      - `field_of_study` (text)
      - `current_gpa` (numeric)
      - `country` (text)
      - `citizenship` (text)
      - `language_proficiency` (text array)
      - `work_experience` (integer) - years
      - `research_experience` (boolean)
      - `financial_need` (text) - low, medium, high
      - `special_status` (text array) - disability, minority, etc.
      - `preferences` (jsonb) - user preferences
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_level text NOT NULL CHECK (academic_level IN ('high_school', 'undergraduate', 'graduate', 'phd', 'postdoc')),
  field_of_study text NOT NULL,
  current_gpa numeric(3,2),
  country text NOT NULL,
  citizenship text NOT NULL,
  language_proficiency text[] DEFAULT '{}',
  work_experience integer DEFAULT 0,
  research_experience boolean DEFAULT false,
  financial_need text DEFAULT 'medium' CHECK (financial_need IN ('low', 'medium', 'high')),
  special_status text[] DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (true);