import { Opportunity } from '../types';

export const cybersecurityOpportunities: Opportunity[] = [
  {
    id: 'commonwealth-cybersec-2024',
    title: 'Commonwealth Scholarship for Cybersecurity Masters',
    institution: 'Commonwealth Scholarship Commission',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-12-01',
    funding_amount: 45000,
    requirements: 'Bachelor\'s degree in Computer Science or related field, minimum 2:1 classification, demonstrated interest in cybersecurity',
    eligibility_criteria: {
      gpa_minimum: 3.3,
      citizenship: ['Nigeria', 'Commonwealth countries'],
      field_requirements: ['Computer Science', 'Information Technology', 'Engineering']
    },
    gpa_requirement: 3.3,
    citizenship_requirements: ['Nigeria', 'Commonwealth countries'],
    language_requirements: {
      english: 'IELTS 6.5 or TOEFL 90'
    },
    application_url: 'https://cscuk.fcdo.gov.uk/scholarships/',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chevening-cybersec-2024',
    title: 'Chevening Scholarship - Cybersecurity Focus',
    institution: 'UK Government (FCDO)',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-11-07',
    funding_amount: 50000,
    requirements: 'Bachelor\'s degree, 2+ years work experience, leadership potential, English proficiency',
    eligibility_criteria: {
      gpa_minimum: 3.0,
      work_experience: '2+ years',
      citizenship: ['Nigeria'],
      leadership_experience: true
    },
    gpa_requirement: 3.0,
    citizenship_requirements: ['Nigeria'],
    language_requirements: {
      english: 'IELTS 6.5 overall'
    },
    application_url: 'https://www.chevening.org/scholarships/',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'oxford-cybersec-scholarship',
    title: 'Oxford Cybersecurity Excellence Scholarship',
    institution: 'University of Oxford',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-12-15',
    funding_amount: 55000,
    requirements: 'First-class honours degree or equivalent, exceptional academic merit, research potential in cybersecurity',
    eligibility_criteria: {
      gpa_minimum: 3.7,
      academic_excellence: true,
      research_experience: 'preferred'
    },
    gpa_requirement: 3.7,
    citizenship_requirements: ['Any'],
    language_requirements: {
      english: 'IELTS 7.5 or TOEFL 110'
    },
    application_url: 'https://www.ox.ac.uk/admissions/graduate/fees-and-funding',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'imperial-cybersec-fellowship',
    title: 'Imperial College Cybersecurity Research Fellowship',
    institution: 'Imperial College London',
    type: 'fellowship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2025-01-31',
    funding_amount: 48000,
    requirements: 'Strong background in computer science, demonstrated research ability, interest in cybersecurity research',
    eligibility_criteria: {
      gpa_minimum: 3.5,
      research_experience: 'required',
      technical_skills: ['Programming', 'Network Security', 'Cryptography']
    },
    gpa_requirement: 3.5,
    citizenship_requirements: ['Any'],
    language_requirements: {
      english: 'IELTS 7.0 or equivalent'
    },
    application_url: 'https://www.imperial.ac.uk/study/pg/fees-and-funding/',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'warwick-cybersec-grant',
    title: 'University of Warwick Cybersecurity Excellence Grant',
    institution: 'University of Warwick',
    type: 'grant',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-11-30',
    funding_amount: 42000,
    requirements: 'Bachelor\'s degree in relevant field, strong academic record, commitment to cybersecurity field',
    eligibility_criteria: {
      gpa_minimum: 3.4,
      field_relevance: true,
      career_commitment: 'cybersecurity'
    },
    gpa_requirement: 3.4,
    citizenship_requirements: ['Any'],
    language_requirements: {
      english: 'IELTS 6.5 minimum'
    },
    application_url: 'https://warwick.ac.uk/study/postgraduate/funding/',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'southampton-cybersec-scholarship',
    title: 'Southampton Cybersecurity Innovation Scholarship',
    institution: 'University of Southampton',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2025-02-28',
    funding_amount: 40000,
    requirements: 'Good honours degree, interest in cybersecurity innovation, potential for research excellence',
    eligibility_criteria: {
      gpa_minimum: 3.2,
      innovation_potential: true,
      research_interest: 'cybersecurity'
    },
    gpa_requirement: 3.2,
    citizenship_requirements: ['Any'],
    language_requirements: {
      english: 'IELTS 6.5 overall, 6.0 in each component'
    },
    application_url: 'https://www.southampton.ac.uk/study/postgraduate/fees-funding',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cisco-cybersec-scholarship',
    title: 'Cisco Cybersecurity Scholarship Program',
    institution: 'Cisco Systems',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-12-31',
    funding_amount: 35000,
    requirements: 'Pursuing cybersecurity degree, demonstrated technical aptitude, commitment to cybersecurity career',
    eligibility_criteria: {
      gpa_minimum: 3.0,
      technical_aptitude: true,
      career_commitment: 'cybersecurity',
      internship_opportunity: true
    },
    gpa_requirement: 3.0,
    citizenship_requirements: ['Any'],
    language_requirements: {
      english: 'Professional working proficiency'
    },
    application_url: 'https://www.cisco.com/c/en/us/about/csr/impact/education.html',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'british-council-cybersec',
    title: 'British Council GREAT Scholarships - Cybersecurity',
    institution: 'British Council',
    type: 'scholarship',
    field: 'Cybersecurity',
    level: 'graduate',
    country: 'United Kingdom',
    deadline: '2024-11-15',
    funding_amount: 25000,
    requirements: 'Nigerian citizenship, excellent academic record, leadership potential, commitment to return to Nigeria',
    eligibility_criteria: {
      gpa_minimum: 3.2,
      citizenship: ['Nigeria'],
      leadership_potential: true,
      return_commitment: true
    },
    gpa_requirement: 3.2,
    citizenship_requirements: ['Nigeria'],
    language_requirements: {
      english: 'IELTS 6.5 or equivalent'
    },
    application_url: 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];