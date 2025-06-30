/*
  # Insert sample opportunities data

  1. Data Insertion
    - Insert 12 sample opportunities covering various fields and countries
    - Include scholarships, fellowships, and grants
    - Cover undergraduate, graduate, and PhD levels
    - Provide realistic funding amounts and requirements

  2. Data Coverage
    - STEM fields (Computer Science, Engineering, Physics, Medicine)
    - Various countries (US, UK, Germany, Canada, China, EU)
    - Different opportunity types and academic levels
    - Comprehensive eligibility criteria and requirements
*/

-- Insert sample opportunities
INSERT INTO opportunities (
  title,
  institution,
  type,
  field,
  level,
  country,
  deadline,
  funding_amount,
  requirements,
  eligibility_criteria,
  gpa_requirement,
  citizenship_requirements,
  language_requirements
) VALUES 
(
  'NSF Graduate Research Fellowship',
  'National Science Foundation',
  'fellowship',
  'Computer Science',
  'graduate',
  'United States',
  '2024-10-15',
  37000,
  'Research proposal, Academic transcripts, Letters of recommendation',
  '{"research_experience": true, "academic_excellence": true}',
  3.5,
  ARRAY['United States'],
  '{"english": "native"}'
),
(
  'DAAD Study Scholarship',
  'German Academic Exchange Service',
  'scholarship',
  'Engineering',
  'graduate',
  'Germany',
  '2024-11-30',
  25000,
  'Academic transcripts, Language certificate, Research proposal',
  '{"academic_excellence": true, "language_proficiency": true}',
  3.0,
  ARRAY['Any'],
  '{"german": "B2", "english": "B2"}'
),
(
  'Rhodes Scholarship',
  'Rhodes Trust',
  'scholarship',
  'Various',
  'graduate',
  'United Kingdom',
  '2024-09-30',
  50000,
  'Academic transcripts, Personal statement, Letters of recommendation, Interview',
  '{"leadership": true, "academic_excellence": true, "service": true}',
  3.7,
  ARRAY['United States', 'Canada', 'Australia', 'South Africa'],
  '{"english": "native"}'
),
(
  'Fulbright Student Program',
  'U.S. Department of State',
  'scholarship',
  'Various',
  'graduate',
  'Various',
  '2024-10-10',
  30000,
  'Academic transcripts, Personal statement, Language evaluation, Project proposal',
  '{"cultural_exchange": true, "academic_merit": true}',
  3.0,
  ARRAY['United States'],
  '{"english": "native", "host_language": "intermediate"}'
),
(
  'Marie Curie Fellowship',
  'European Commission',
  'fellowship',
  'Physics',
  'phd',
  'Various',
  '2024-12-15',
  45000,
  'Research proposal, CV, Letters of recommendation, Host agreement',
  '{"research_excellence": true, "mobility": true}',
  NULL,
  ARRAY['Any'],
  '{"english": "B2"}'
),
(
  'Gates Cambridge Scholarship',
  'Gates Cambridge Trust',
  'scholarship',
  'Various',
  'graduate',
  'United Kingdom',
  '2024-12-01',
  45000,
  'Academic transcripts, Research proposal, Personal statement, Letters of recommendation',
  '{"academic_excellence": true, "leadership": true, "commitment_to_improving_lives": true}',
  3.8,
  ARRAY['Any except UK'],
  '{"english": "C1"}'
),
(
  'Chevening Scholarship',
  'UK Government',
  'scholarship',
  'Various',
  'graduate',
  'United Kingdom',
  '2024-11-07',
  35000,
  'Academic transcripts, Personal statement, Letters of recommendation, Work experience',
  '{"leadership_potential": true, "academic_excellence": true, "networking_skills": true}',
  3.0,
  ARRAY['Chevening-eligible countries'],
  '{"english": "B2"}'
),
(
  'Schwarzman Scholars',
  'Schwarzman Scholars Program',
  'scholarship',
  'Various',
  'graduate',
  'China',
  '2024-09-15',
  40000,
  'Academic transcripts, Personal essays, Letters of recommendation, Interview',
  '{"leadership": true, "academic_excellence": true, "global_perspective": true}',
  3.5,
  ARRAY['Any'],
  '{"english": "C1"}'
),
(
  'Erasmus Mundus Joint Master',
  'European Union',
  'scholarship',
  'Computer Science',
  'graduate',
  'Various',
  '2024-12-31',
  28000,
  'Academic transcripts, Personal statement, Letters of recommendation, Language certificates',
  '{"academic_excellence": true, "mobility": true}',
  3.2,
  ARRAY['Any'],
  '{"english": "B2"}'
),
(
  'Commonwealth Scholarship',
  'Commonwealth Scholarship Commission',
  'scholarship',
  'Medicine',
  'phd',
  'United Kingdom',
  '2024-12-15',
  35000,
  'Academic transcripts, Research proposal, Letters of recommendation, Development impact statement',
  '{"academic_merit": true, "development_potential": true}',
  3.5,
  ARRAY['Commonwealth countries'],
  '{"english": "B2"}'
),
(
  'AAUW International Fellowship',
  'American Association of University Women',
  'fellowship',
  'Various',
  'graduate',
  'United States',
  '2024-11-15',
  20000,
  'Academic transcripts, Personal statement, Letters of recommendation, Research proposal',
  '{"academic_excellence": true, "commitment_to_women_advancement": true}',
  3.0,
  ARRAY['Non-US citizens'],
  '{"english": "B2"}'
),
(
  'Vanier Canada Graduate Scholarship',
  'Government of Canada',
  'scholarship',
  'Various',
  'phd',
  'Canada',
  '2024-11-01',
  50000,
  'Academic transcripts, Research proposal, Letters of recommendation, Leadership statement',
  '{"academic_excellence": true, "research_potential": true, "leadership": true}',
  3.7,
  ARRAY['Any'],
  '{"english": "C1", "french": "optional"}'
);