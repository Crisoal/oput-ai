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
  requirements: string;
  eligibility_criteria: any;
  gpa_requirement?: number;
  citizenship_requirements?: string[];
  language_requirements?: any;
  application_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface OpportunityMatch {
  id: string;
  user_id: string;
  opportunity_id: string;
  match_score: number;
  success_probability: number;
  eligibility_status: 'eligible' | 'partially_eligible' | 'not_eligible' | 'pending';
  action_items: string[];
  is_bookmarked: boolean;
  application_status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id?: string;
  academic_level: string;
  field_of_study: string;
  current_gpa?: number;
  country: string;
  citizenship: string;
  language_proficiency: string[];
  work_experience?: string;
  research_experience?: string;
  financial_need?: 'low' | 'medium' | 'high';
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
  canPlayAudio?: boolean;
}

export interface ConversationContext {
  user_id?: string;
  current_stage: 'greeting' | 'profiling' | 'searching' | 'results';
  collected_info: Partial<UserProfile>;
  last_query: string;
  opportunities_shown: string[];
}

export interface FilterOptions {
  type: string[];
  level: string[];
  country: string[];
  field: string[];
  minFunding: number;
  maxFunding: number;
  deadlineRange: string;
  minMatchScore: number;
}