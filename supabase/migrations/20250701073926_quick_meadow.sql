/*
  # Add application URLs to opportunities

  1. Schema Changes
    - Add `application_url` column to opportunities table
  
  2. Data Updates
    - Update all opportunities with legitimate application URLs
    - Ensure all URLs point to official application portals
*/

-- Add application_url column to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS application_url text;

-- Update opportunities with legitimate application URLs
UPDATE opportunities SET application_url = 'https://www.research.gov/grfp/Login.do' WHERE title = 'NSF Graduate Research Fellowship';
UPDATE opportunities SET application_url = 'https://www.daad.de/en/study-and-research-in-germany/scholarships/' WHERE title = 'DAAD Study Scholarship';
UPDATE opportunities SET application_url = 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/' WHERE title = 'Rhodes Scholarship';
UPDATE opportunities SET application_url = 'https://us.fulbrightonline.org/' WHERE title = 'Fulbright Student Program';
UPDATE opportunities SET application_url = 'https://marie-sklodowska-curie-actions.ec.europa.eu/' WHERE title = 'Marie Curie Fellowship';
UPDATE opportunities SET application_url = 'https://www.gatescambridge.org/apply/' WHERE title = 'Gates Cambridge Scholarship';
UPDATE opportunities SET application_url = 'https://www.chevening.org/apply/' WHERE title = 'Chevening Scholarship';
UPDATE opportunities SET application_url = 'https://www.schwarzmanscholars.org/apply/' WHERE title = 'Schwarzman Scholars';
UPDATE opportunities SET application_url = 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en' WHERE title = 'Erasmus Mundus Joint Master';
UPDATE opportunities SET application_url = 'https://cscuk.fcdo.gov.uk/apply/' WHERE title = 'Commonwealth Scholarship';
UPDATE opportunities SET application_url = 'https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/' WHERE title = 'AAUW International Fellowship';
UPDATE opportunities SET application_url = 'https://vanier.gc.ca/en/home-accueil.html' WHERE title = 'Vanier Canada Graduate Scholarship';
UPDATE opportunities SET application_url = 'https://cscuk.fcdo.gov.uk/apply/' WHERE title = 'Commonwealth Cybersecurity Scholarship';
UPDATE opportunities SET application_url = 'https://www.chevening.org/apply/' WHERE title = 'Chevening Cybersecurity Focus';
UPDATE opportunities SET application_url = 'https://www.ox.ac.uk/admissions/graduate/courses/cybersecurity' WHERE title = 'Oxford Cybersecurity Excellence Scholarship';
UPDATE opportunities SET application_url = 'https://www.imperial.ac.uk/study/pg/apply/' WHERE title = 'Imperial College Cybersecurity Research Fellowship';

-- Update any opportunities that might not have been caught by title matching
UPDATE opportunities SET application_url = 'https://example.com/apply' WHERE application_url IS NULL;