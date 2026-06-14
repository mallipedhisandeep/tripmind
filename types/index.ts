export type TravelStyle = 'budget' | 'moderate' | 'comfortable' | 'premium'
export type GroupType = 'solo' | 'couple' | 'friends' | 'family_kids' | 'family_elders'
export type Transport = 'train' | 'flight' | 'bus' | 'car' | 'any'
export type Lang = 'en' | 'hi' | 'te'

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
  is_pro: boolean
  pro_expires_at?: string
  lang: Lang
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
  share_token?: string
  share_enabled: boolean
  created_at: string
  updated_at: string
}

// Phase 2 — Watchlist
export type WatchlistType = 'train_seat' | 'darshan_slot' | 'hotel_price' | 'bus_seat' | 'flight_price'

export interface WatchlistItem {
  id: string
  user_id: string
  trip_id?: string
  type: WatchlistType
  label: string
  params: Record<string, any>   // e.g. { train_no: '12723', date: '2025-08-15', class: '3A' }
  target_price?: number         // alert when price drops below this
  notified: boolean
  active: boolean
  whatsapp_number?: string
  created_at: string
  last_checked_at?: string
}

// Phase 3 — Razorpay
export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
}

// Phase 4 — Group planning
export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface TripMember {
  id: string
  trip_id: string
  user_id?: string
  email: string
  role: MemberRole
  invite_token: string
  accepted: boolean
  created_at: string
}
