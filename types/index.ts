export type TravelStyle = 'budget' | 'moderate' | 'comfortable' | 'premium'
export type GroupType = 'solo' | 'couple' | 'friends' | 'family_kids' | 'family_elders'
export type Transport = 'train' | 'flight' | 'bus' | 'car' | 'any'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  home_city: string
  travel_style: TravelStyle
  group_type: GroupType
  interests: string[]
  preferred_transport: Transport
  onboarding_complete: boolean
  created_at: string
}

export interface TripForm {
  from: string
  to: string
  start_date: string
  end_date: string
  days: number
  travelers: number
  group_type: GroupType
  age_groups: string[]
  budget: TravelStyle
  interests: string[]
  transport: Transport
  special_notes?: string
}

export interface ItinerarySlot {
  time: string
  activity: string
  type: 'travel' | 'temple' | 'food' | 'stay' | 'nature' | 'heritage' | 'shopping' | 'leisure'
  icon: string
  tip: string
  booking_link?: string
  duration_mins?: number
}

export interface DayPlan {
  day: number
  date: string
  title: string
  slots: ItinerarySlot[]
}

export interface Hotel {
  name: string
  price_range: string
  rating: number
  tag: string
  booking_url: string
  address?: string
}

export interface GeneratedPlan {
  id?: string
  destination: string
  from: string
  days: number
  summary: string
  why_this_plan: string
  total_budget_min: number
  total_budget_max: number
  budget_breakdown: {
    transport: number
    accommodation: number
    food: number
    activities: number
    misc: number
  }
  days_plan: DayPlan[]
  hotels: Hotel[]
  food_recommendations: string[]
  practical_tips: string[]
  booking_links: {
    train?: string
    flight?: string
    hotel?: string
    bus?: string
  }
  route_highlights: string[]
  best_time_to_visit: string
  crowd_warning?: string
  weather_note?: string
}

export interface SavedTrip {
  id: string
  user_id: string
  form_data: TripForm
  generated_plan: GeneratedPlan
  regen_count: number
  status: 'draft' | 'saved' | 'completed'
  created_at: string
  updated_at: string
}
