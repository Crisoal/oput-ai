import { supabase } from './supabase';
import { Opportunity, UserProfile, OpportunityMatch } from '../types';

export class SupabaseService {
  // Get all opportunities from database
  async getAllOpportunities(): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('deadline', { ascending: true });

      if (error) {
        console.error('Error fetching all opportunities:', error);
        return [];
      }

      // Transform the data to match our interface
      return (data || []).map(opp => this.transformOpportunity(opp));
    } catch (error) {
      console.error('Error in getAllOpportunities:', error);
      return [];
    }
  }

  // Transform database opportunity to match our interface
  private transformOpportunity(opp: any): Opportunity {
    return {
      ...opp,
      funding_amount: this.parseFundingAmount(opp.funding_amount),
      application_url: opp.application_url || `https://example.com/apply/${opp.id}`,
      requirements: typeof opp.requirements === 'string' ? opp.requirements : (opp.requirements?.join(', ') || ''),
      citizenship_requirements: Array.isArray(opp.citizenship_requirements) ? opp.citizenship_requirements : [],
      eligibility_criteria: opp.eligibility_criteria || {},
      language_requirements: opp.language_requirements || {},
      created_at: opp.created_at || new Date().toISOString(),
      updated_at: opp.updated_at || new Date().toISOString(),
    };
  }

  // Parse funding amount from various formats
  private parseFundingAmount(amount: any): number {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      // Remove currency symbols and commas, extract numbers
      const cleaned = amount.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Enhanced opportunity search with better filtering
  async searchOpportunities(filters: {
    level?: string;
    field?: string;
    country?: string;
    type?: string;
    gpa_requirement?: number;
    citizenship?: string;
  }): Promise<Opportunity[]> {
    try {
      console.log('Searching with filters:', filters);
      
      let query = supabase
        .from('opportunities')
        .select('*');

      // Academic level filter
      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      // Field of study filter - more flexible matching
      if (filters.field) {
        // Handle specific field mappings
        let searchField = filters.field.toLowerCase();
        
        // Map common variations
        if (searchField.includes('computer science') || searchField.includes('cs')) {
          query = query.or(`field.ilike.%Computer Science%,field.ilike.%Cybersecurity%,field.ilike.%Various%`);
        } else if (searchField.includes('cybersecurity')) {
          query = query.or(`field.ilike.%Cybersecurity%,field.ilike.%Computer Science%,field.ilike.%Various%`);
        } else if (searchField.includes('engineering')) {
          query = query.or(`field.ilike.%Engineering%,field.ilike.%Various%`);
        } else if (searchField.includes('medicine')) {
          query = query.or(`field.ilike.%Medicine%,field.ilike.%Various%`);
        } else if (searchField.includes('business')) {
          query = query.or(`field.ilike.%Business%,field.ilike.%Various%`);
        } else {
          // Generic field search
          query = query.or(`field.ilike.%${filters.field}%,field.ilike.%Various%`);
        }
      }

      // Country filter
      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      // Type filter
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      // GPA requirement filter - only show opportunities user is eligible for
      if (filters.gpa_requirement) {
        query = query.or(`gpa_requirement.is.null,gpa_requirement.lte.${filters.gpa_requirement}`);
      }

      // Citizenship filter - more comprehensive
      if (filters.citizenship) {
        const citizenship = filters.citizenship;
        
        // Build citizenship filter conditions
        const conditions = [
          `citizenship_requirements.cs.{${citizenship}}`,
          `citizenship_requirements.cs.{Any}`,
          `citizenship_requirements.cs.{"Any"}`,
          `citizenship_requirements.is.null`
        ];

        // Add specific conditions for common citizenships
        if (citizenship === 'Nigeria') {
          conditions.push(`citizenship_requirements.cs.{"Commonwealth countries"}`);
          conditions.push(`citizenship_requirements.cs.{"Non-US citizens"}`);
        } else if (citizenship === 'United States') {
          conditions.push(`citizenship_requirements.cs.{"United States"}`);
        } else if (['Ghana', 'Kenya', 'India'].includes(citizenship)) {
          conditions.push(`citizenship_requirements.cs.{"Commonwealth countries"}`);
          conditions.push(`citizenship_requirements.cs.{"Non-US citizens"}`);
        }

        query = query.or(conditions.join(','));
      }

      // Only get currently open opportunities
      const currentDate = new Date().toISOString().split('T')[0];
      query = query.gte('deadline', currentDate);

      const { data, error } = await query.order('deadline', { ascending: true });

      if (error) {
        console.error('Error searching opportunities:', error);
        return [];
      }

      console.log('Raw search results:', data?.length || 0);

      // Transform the data to match our interface
      const opportunities = (data || []).map(opp => this.transformOpportunity(opp));

      console.log('Transformed opportunities:', opportunities.length);
      return opportunities;
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

      return this.transformOpportunity(data);
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

  // Enhanced match score calculation
  calculateMatchScore(userProfile: UserProfile, opportunity: Opportunity): number {
    let score = 0;
    let totalWeight = 0;

    // Academic level match (25%)
    const levelWeight = 25;
    if (userProfile.academic_level === opportunity.level) {
      score += levelWeight;
    } else if (
      (userProfile.academic_level === 'graduate' && opportunity.level === 'phd') ||
      (userProfile.academic_level === 'undergraduate' && opportunity.level === 'graduate')
    ) {
      score += levelWeight * 0.7; // 70% match for adjacent levels
    }
    totalWeight += levelWeight;

    // Field of study match (30%)
    const fieldWeight = 30;
    if (userProfile.field_of_study && opportunity.field) {
      const userField = userProfile.field_of_study.toLowerCase();
      const oppField = opportunity.field.toLowerCase();
      
      if (oppField === 'various') {
        score += fieldWeight * 0.8; // 80% match for "Various" fields
      } else if (userField === oppField) {
        score += fieldWeight; // Perfect match
      } else if (userField.includes(oppField) || oppField.includes(userField)) {
        score += fieldWeight * 0.9; // 90% match for partial matches
      } else if (this.isRelatedField(userField, oppField)) {
        score += fieldWeight * 0.6; // 60% match for related fields
      }
    }
    totalWeight += fieldWeight;

    // GPA requirement (20%)
    const gpaWeight = 20;
    if (opportunity.gpa_requirement && userProfile.current_gpa) {
      if (userProfile.current_gpa >= opportunity.gpa_requirement) {
        const excess = userProfile.current_gpa - opportunity.gpa_requirement;
        score += gpaWeight * Math.min(1, 0.8 + (excess * 0.1)); // Bonus for higher GPA
      } else if (userProfile.current_gpa >= opportunity.gpa_requirement - 0.3) {
        score += gpaWeight * 0.5; // 50% match if close to requirement
      }
    } else if (!opportunity.gpa_requirement) {
      score += gpaWeight * 0.9; // 90% match if no GPA requirement
    }
    totalWeight += gpaWeight;

    // Citizenship requirements (20%)
    const citizenshipWeight = 20;
    if (opportunity.citizenship_requirements && userProfile.citizenship) {
      const requirements = opportunity.citizenship_requirements;
      if (requirements.includes(userProfile.citizenship) || 
          requirements.includes('Any') ||
          (userProfile.citizenship === 'Nigeria' && requirements.includes('Commonwealth countries')) ||
          (userProfile.citizenship !== 'United States' && requirements.includes('Non-US citizens'))) {
        score += citizenshipWeight;
      }
    } else if (!opportunity.citizenship_requirements || opportunity.citizenship_requirements.length === 0) {
      score += citizenshipWeight * 0.8; // 80% match if no citizenship requirement
    }
    totalWeight += citizenshipWeight;

    // Country preference (5%)
    const countryWeight = 5;
    if (userProfile.country && opportunity.country) {
      if (userProfile.country === opportunity.country) {
        score += countryWeight;
      } else if (this.isNearbyCountry(userProfile.country, opportunity.country)) {
        score += countryWeight * 0.5;
      }
    }
    totalWeight += countryWeight;

    const finalScore = Math.round((score / totalWeight) * 100);
    return Math.max(0, Math.min(100, finalScore)); // Ensure score is between 0-100
  }

  private isRelatedField(field1: string, field2: string): boolean {
    const relatedFields = {
      'computer science': ['cybersecurity', 'artificial intelligence', 'machine learning', 'data science', 'software engineering'],
      'cybersecurity': ['computer science', 'information security', 'network security'],
      'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering', 'computer science'],
      'business': ['management', 'finance', 'marketing', 'economics'],
      'medicine': ['biology', 'chemistry', 'health sciences', 'biomedical'],
      'artificial intelligence': ['computer science', 'machine learning', 'data science'],
    };

    for (const [key, related] of Object.entries(relatedFields)) {
      if ((field1.includes(key) && related.some(r => field2.includes(r))) ||
          (field2.includes(key) && related.some(r => field1.includes(r)))) {
        return true;
      }
    }

    return false;
  }

  private isNearbyCountry(country1: string, country2: string): boolean {
    const regions = {
      'europe': ['germany', 'france', 'italy', 'spain', 'netherlands', 'sweden', 'norway', 'denmark', 'united kingdom'],
      'north_america': ['united states', 'canada', 'mexico'],
      'asia': ['china', 'japan', 'south korea', 'singapore', 'india'],
      'africa': ['nigeria', 'ghana', 'kenya', 'south africa'],
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

  // Enhanced action items generation
  generateActionItems(opportunity: Opportunity, userProfile: Partial<UserProfile>): string[] {
    const items = [];
    
    // Basic requirements
    items.push('Review complete eligibility requirements');
    items.push('Prepare official academic transcripts');
    
    // GPA-specific advice
    if (opportunity.gpa_requirement && userProfile.current_gpa) {
      if (userProfile.current_gpa < opportunity.gpa_requirement) {
        items.push(`Improve GPA to meet ${opportunity.gpa_requirement} requirement`);
      } else {
        items.push('Highlight your strong academic performance');
      }
    }
    
    // Field-specific requirements
    if (opportunity.type === 'research' || opportunity.level === 'phd') {
      items.push('Draft a compelling research proposal');
      items.push('Contact potential supervisors or mentors');
      items.push('Prepare research portfolio or publications');
    }
    
    // Language requirements
    if (opportunity.language_requirements) {
      items.push('Prepare required language proficiency certificates');
    }
    
    // Application materials
    items.push('Secure 2-3 strong letters of recommendation');
    items.push('Write a compelling personal statement');
    items.push('Prepare CV/resume highlighting relevant experience');
    
    // Deadline management
    if (opportunity.deadline) {
      const deadline = new Date(opportunity.deadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 30) {
        items.push(`URGENT: Submit application before ${deadline.toLocaleDateString()} (${daysLeft} days left)`);
      } else {
        items.push(`Submit application before deadline: ${deadline.toLocaleDateString()}`);
      }
    }
    
    return items;
  }
}