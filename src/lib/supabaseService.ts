import { supabase } from './supabase';
import { Opportunity, UserProfile, OpportunityMatch } from '../types';

export class SupabaseService {
  // Opportunity queries
  async searchOpportunities(filters: {
    level?: string;
    field?: string;
    country?: string;
    type?: string;
    gpa_requirement?: number;
    citizenship?: string;
  }): Promise<Opportunity[]> {
    try {
      let query = supabase
        .from('opportunities')
        .select('*');

      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.field) {
        query = query.ilike('field', `%${filters.field}%`);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.gpa_requirement) {
        query = query.lte('gpa_requirement', filters.gpa_requirement);
      }
      if (filters.citizenship) {
        query = query.contains('citizenship_requirements', [filters.citizenship]);
      }

      const { data, error } = await query.order('deadline', { ascending: true });

      if (error) {
        console.error('Error searching opportunities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchOpportunities:', error);
      return [];
    }
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching opportunity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOpportunityById:', error);
      return null;
    }
  }

  // User profile management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  async createOrUpdateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
      return null;
    }
  }

  // Opportunity matches
  async createOpportunityMatch(match: Partial<OpportunityMatch>): Promise<OpportunityMatch | null> {
    try {
      const { data, error } = await supabase
        .from('opportunity_matches')
        .upsert(match, { onConflict: 'user_id,opportunity_id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity match:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createOpportunityMatch:', error);
      return null;
    }
  }

  async getUserMatches(userId: string): Promise<(OpportunityMatch & { opportunity: Opportunity })[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_matches')
        .select(`
          *,
          opportunity:opportunities(*)
        `)
        .eq('user_id', userId)
        .order('match_score', { ascending: false });

      if (error) {
        console.error('Error fetching user matches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserMatches:', error);
      return [];
    }
  }

  async updateMatchStatus(matchId: string, updates: Partial<OpportunityMatch>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('opportunity_matches')
        .update(updates)
        .eq('id', matchId);

      if (error) {
        console.error('Error updating match status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateMatchStatus:', error);
      return false;
    }
  }

  // Calculate match score based on user profile and opportunity
  calculateMatchScore(userProfile: UserProfile, opportunity: Opportunity): number {
    let score = 0;
    let factors = 0;

    // Academic level match (30%)
    if (userProfile.academic_level === opportunity.level) {
      score += 30;
    } else if (
      (userProfile.academic_level === 'graduate' && opportunity.level === 'phd') ||
      (userProfile.academic_level === 'undergraduate' && opportunity.level === 'graduate')
    ) {
      score += 20;
    }
    factors += 30;

    // Field of study match (25%)
    if (userProfile.field_of_study && opportunity.field) {
      if (userProfile.field_of_study.toLowerCase().includes(opportunity.field.toLowerCase()) ||
          opportunity.field.toLowerCase().includes(userProfile.field_of_study.toLowerCase())) {
        score += 25;
      } else if (this.isRelatedField(userProfile.field_of_study, opportunity.field)) {
        score += 15;
      }
    }
    factors += 25;

    // GPA requirement (20%)
    if (opportunity.gpa_requirement && userProfile.current_gpa) {
      if (userProfile.current_gpa >= opportunity.gpa_requirement) {
        score += 20;
      } else if (userProfile.current_gpa >= opportunity.gpa_requirement - 0.3) {
        score += 10;
      }
    } else if (!opportunity.gpa_requirement) {
      score += 15;
    }
    factors += 20;

    // Citizenship requirements (15%)
    if (opportunity.citizenship_requirements && userProfile.citizenship) {
      if (opportunity.citizenship_requirements.includes(userProfile.citizenship) ||
          opportunity.citizenship_requirements.includes('Any')) {
        score += 15;
      }
    } else if (!opportunity.citizenship_requirements) {
      score += 10;
    }
    factors += 15;

    // Country preference (10%)
    if (userProfile.country && opportunity.country) {
      if (userProfile.country === opportunity.country) {
        score += 10;
      } else if (this.isNearbyCountry(userProfile.country, opportunity.country)) {
        score += 5;
      }
    }
    factors += 10;

    return Math.round((score / factors) * 100);
  }

  private isRelatedField(field1: string, field2: string): boolean {
    const relatedFields = {
      'computer science': ['artificial intelligence', 'machine learning', 'data science', 'software engineering'],
      'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering'],
      'business': ['management', 'finance', 'marketing', 'economics'],
      'medicine': ['biology', 'chemistry', 'health sciences', 'biomedical'],
    };

    const f1 = field1.toLowerCase();
    const f2 = field2.toLowerCase();

    for (const [key, related] of Object.entries(relatedFields)) {
      if ((f1.includes(key) && related.some(r => f2.includes(r))) ||
          (f2.includes(key) && related.some(r => f1.includes(r)))) {
        return true;
      }
    }

    return false;
  }

  private isNearbyCountry(country1: string, country2: string): boolean {
    const regions = {
      'europe': ['germany', 'france', 'italy', 'spain', 'netherlands', 'sweden', 'norway', 'denmark'],
      'north_america': ['united states', 'canada', 'mexico'],
      'asia': ['china', 'japan', 'south korea', 'singapore', 'india'],
    };

    const c1 = country1.toLowerCase();
    const c2 = country2.toLowerCase();

    for (const region of Object.values(regions)) {
      if (region.includes(c1) && region.includes(c2)) {
        return true;
      }
    }

    return false;
  }
}