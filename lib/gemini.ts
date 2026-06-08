import { TripForm, GeneratedPlan } from '@/types'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function generateTripPlan(form: TripForm, userPreferences?: string): Promise<GeneratedPlan> {
  const prompt = buildPrompt(form, userPreferences)

  const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('No response from Gemini')

  // Clean and parse JSON
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const plan: GeneratedPlan = JSON.parse(cleaned)
  return plan
}

function buildPrompt(form: TripForm, userPreferences?: string): string {
  const groupLabel: Record<string, string> = {
    solo: 'solo traveler',
    couple: 'couple',
    friends: 'group of friends',
    family_kids: 'family with kids',
    family_elders: 'family with elderly members',
  }

  const budgetLabel: Record<string, string> = {
    budget: 'budget (economy, under ₹5,000 per person)',
    moderate: 'moderate (₹5,000–₹15,000 per person)',
    comfortable: 'comfortable (₹15,000–₹30,000 per person)',
    premium: 'premium (above ₹30,000 per person)',
  }

  return `You are TripMind — India's most knowledgeable local travel expert with deep knowledge of Indian railways, temple systems, local food, budget travel, and ground-level travel tips.

Generate a complete, highly detailed, practical travel plan for the following trip.

TRIP DETAILS:
- From: ${form.from}
- To: ${form.to}
- Travel Dates: ${form.start_date} to ${form.end_date} (${form.days} days)
- Number of Travelers: ${form.travelers}
- Group Type: ${groupLabel[form.group_type] || form.group_type}
- Age Groups: ${form.age_groups.join(', ')}
- Budget: ${budgetLabel[form.budget] || form.budget}
- Interests: ${form.interests.join(', ')}
- Preferred Transport: ${form.transport}
${form.special_notes ? `- Special Notes: ${form.special_notes}` : ''}
${userPreferences ? `\nUSER TRAVEL PREFERENCES (learned from past trips):\n${userPreferences}` : ''}

CRITICAL INSTRUCTIONS:
1. Give EXACT train numbers, departure times, platform info where known
2. Give REAL temple timings, darshan types, queue warnings, booking portal links
3. Give HYPERLOCAL food recommendations — specific dish names, areas, price ranges
4. For each day slot, include a practical insider tip that most people don't know
5. Flag crowd warnings, seasonal issues, or booking urgency where relevant
6. Recommend stops ON THE ROUTE between origin and destination that match interests
7. Give honest transport comparison — explain exactly WHY one mode beats another
8. Budget breakdown must be realistic for Indian travel in 2025

Respond ONLY with a valid JSON object matching this exact structure. No preamble, no explanation, no markdown:

{
  "destination": "string",
  "from": "string", 
  "days": number,
  "summary": "2-3 sentence personalized summary of this trip",
  "why_this_plan": "3-4 sentences explaining transport choice, timing, and key decisions",
  "total_budget_min": number,
  "total_budget_max": number,
  "budget_breakdown": {
    "transport": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "misc": number
  },
  "days_plan": [
    {
      "day": 1,
      "date": "string",
      "title": "string",
      "slots": [
        {
          "time": "string (e.g. 6:00 AM)",
          "activity": "string (specific, detailed)",
          "type": "travel|temple|food|stay|nature|heritage|shopping|leisure",
          "icon": "single emoji",
          "tip": "string (insider tip most people don't know)",
          "booking_link": "string (URL if applicable, else null)",
          "duration_mins": number
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string",
      "price_range": "string (e.g. ₹1,500–₹2,000/night)",
      "rating": number,
      "tag": "string (e.g. Best Value, Most Reliable, Budget Pick)",
      "booking_url": "string (MakeMyTrip or Booking.com search URL)",
      "address": "string"
    }
  ],
  "food_recommendations": ["string array of local dishes and where to eat them"],
  "practical_tips": ["string array of 5-7 critical practical tips"],
  "booking_links": {
    "train": "string (IRCTC search URL)",
    "flight": "string or null",
    "hotel": "string (MakeMyTrip URL)",
    "bus": "string or null"
  },
  "route_highlights": ["string array of notable stops between origin and destination"],
  "best_time_to_visit": "string",
  "crowd_warning": "string or null",
  "weather_note": "string or null"
}`
}
