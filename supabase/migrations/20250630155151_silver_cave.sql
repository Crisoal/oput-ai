/*
  # Create opportunities database schema

  1. New Tables
    - `opportunities`
      - `id` (uuid, primary key)
      - `title` (text)
      - `institution` (text)
      - `type` (text) - scholarship, grant, fellowship, internship, research
      - `field` (text)
      - `level` (text) - undergraduate, graduate, phd, postdoc
      - `country` (text)
      - `deadline` (date)
      - `funding_amount` (integer)
      - `requirements` (text array)
      - `eligibility_criteria` (text array)
      - `gpa_requirement` (numeric)
      - `citizenship_requirements` (text array)
      - `language_requirements` (text array)
      - `description` (text)
      - `application_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `opportunities` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  institution text NOT NULL,
  type text NOT NULL CHECK (type IN ('scholarship', 'grant', 'fellowship', 'internship', 'research')),
  field text NOT NULL,
  level text NOT NULL CHECK (level IN ('undergraduate', 'graduate', 'phd', 'postdoc')),
  country text NOT NULL,
  deadline date NOT NULL,
  funding_amount integer NOT NULL DEFAULT 0,
  requirements text[] DEFAULT '{}',
  eligibility_criteria text[] DEFAULT '{}',
  gpa_requirement numeric(3,2),
  citizenship_requirements text[] DEFAULT '{}',
  language_requirements text[] DEFAULT '{}',
  description text NOT NULL,
  application_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities are publicly readable"
  ON opportunities
  FOR SELECT
  TO public
  USING (true);

-- Insert sample opportunities
INSERT INTO opportunities (
  title, institution, type, field, level, country, deadline, funding_amount,
  requirements, eligibility_criteria, gpa_requirement, citizenship_requirements,
  language_requirements, description, application_url
) VALUES
(
  'NSF Graduate Research Fellowship Program',
  'National Science Foundation',
  'fellowship',
  'STEM Fields',
  'graduate',
  'United States',
  '2024-10-21',
  37000,
  ARRAY['US Citizen or Permanent Resident', 'Graduate student in STEM field', 'Research proposal'],
  ARRAY['Pursuing graduate degree', 'STEM discipline', 'Research experience'],
  3.5,
  ARRAY['US Citizen', 'Permanent Resident'],
  ARRAY['English'],
  'The NSF Graduate Research Fellowship Program (GRFP) supports outstanding graduate students in NSF-supported science, technology, engineering, and mathematics disciplines who are pursuing research-based master''s and doctoral degrees.',
  'https://www.nsfgrfp.org/'
),
(
  'Fulbright Student Program',
  'U.S. Department of State',
  'scholarship',
  'Various',
  'graduate',
  'Various Countries',
  '2024-10-10',
  25000,
  ARRAY['US Citizen', 'Bachelor''s degree', 'Language proficiency'],
  ARRAY['Study/research abroad', 'Cultural engagement', 'Academic merit'],
  3.0,
  ARRAY['US Citizen'],
  ARRAY['Host country language or English'],
  'The Fulbright Student Program provides grants for U.S. graduating seniors, graduate students, and young professionals to study, conduct research, and teach abroad.',
  'https://us.fulbrightonline.org/'
),
(
  'Gates Cambridge Scholarship',
  'University of Cambridge',
  'scholarship',
  'Various',
  'graduate',
  'United Kingdom',
  '2024-12-05',
  75000,
  ARRAY['Outstanding academic record', 'Leadership potential', 'Commitment to improving lives of others'],
  ARRAY['International student', 'Full-time graduate study at Cambridge', 'Academic excellence'],
  3.7,
  ARRAY['Non-UK citizen'],
  ARRAY['English'],
  'The Gates Cambridge Scholarship programme was established through a donation of US$210 million from the Bill and Melinda Gates Foundation to the University of Cambridge.',
  'https://www.gatescambridge.org/'
),
(
  'Rhodes Scholarship',
  'Rhodes Trust',
  'scholarship',
  'Various',
  'graduate',
  'United Kingdom',
  '2024-10-01',
  70000,
  ARRAY['Academic excellence', 'Leadership', 'Service to others', 'Physical vigor'],
  ARRAY['Undergraduate degree', 'Age 18-24', 'Citizenship eligibility'],
  3.7,
  ARRAY['US', 'Australia', 'Canada', 'Germany', 'India', 'New Zealand', 'South Africa', 'Various others'],
  ARRAY['English'],
  'The Rhodes Scholarship is the oldest and most celebrated international fellowship award in the world, bringing outstanding students from around the world to study at the University of Oxford.',
  'https://www.rhodesscholar.org/'
);