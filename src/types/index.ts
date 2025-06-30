export interface Opportunity {
  id: string;
  title: string;
  institution: string;
  type: 'scholarship' | 'grant' | 'fellowship' | 'internship' | 'research';
  field: string;
  level: 'undergraduate' | 'graduate' | 'phd' | 'postdoc';
  country: string;
  deadline: string;
  funding_amount: number;
  requirements: string[];
  eligibility_criteria: string[];
  gpa_requirement?: number;
  citizenship_requirements?: string[];
  language_requirements?: string[];
  description: string;
  application_url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  academic_level: string;
  field_of_study: string;
  current_gpa?: number;
  country: string;
  citizenship: string;
  language_proficiency: string[];
  work_experience: number;
  research_experience: boolean;
  financial_need: 'low' | 'medium' | 'high';
  special_status?: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice';
}

export interface ConversationContext {
  user_id?: string;
  current_stage: 'greeting' | 'profiling' | 'searching' | 'results';
  collected_info: Partial<UserProfile>;
  last_query: string;
  opportunities_shown: string[];
}