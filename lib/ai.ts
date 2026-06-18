import { TripForm, GeneratedPlan } from '@/types'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function generateTripPlan(form: TripForm, userPreferences?: string): Promise<GeneratedPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured')

  const prompt = buildPrompt(form, userPreferences)

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text
  if (!text) throw new Error('Empty response from AI')

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse plan. Please try again.')
  }
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
    budget: 'under ₹5,000 per person',
    moderate: '₹5,000–₹15,000 per person',
    comfortable: '₹15,000–₹30,000 per person',
    premium: 'above ₹30,000 per person',
  }

  return `You are TripMind — India's most detailed local travel expert. You have deep knowledge of Indian railways, temple systems, darshan queues, local food, and ground-level travel tips that no other app provides.

Generate a complete, hyperlocal, practical travel plan for this trip.

TRIP DETAILS:
- From: ${form.from}
- To: ${form.to}
- Dates: ${form.start_date} to ${form.end_date} (${form.days} days)
- Travelers: ${form.travelers} (${groupLabel[form.group_type] || form.group_type})
- Age groups: ${form.age_groups?.join(', ')}
- Budget: ${budgetLabel[form.budget] || form.budget}
- Interests: ${form.interests.join(', ')}
- Transport preference: ${form.transport}
${form.special_notes ? `- Special notes: ${form.special_notes}` : ''}
${userPreferences ? `\nUser's past travel preferences:\n${userPreferences}` : ''}

INSTRUCTIONS:
- Give EXACT train numbers, real departure times, correct platform info
- Give REAL temple timings, darshan slot types, queue duration warnings, official booking links
- Give hyperlocal food tips — specific dish names, exact areas, price ranges in rupees
- Each activity slot must have a practical insider tip that most people don't know
- Flag crowd warnings, seasonal issues, booking urgency
- Suggest notable stops ON THE ROUTE that match user interests
- Explain WHY you chose this transport over alternatives
- All budgets must be realistic for Indian travel in 2025

Respond ONLY with a valid JSON object. No markdown, no explanation, no extra text before or after:

{
  "destination": "string",
  "from": "string",
  "days": number,
  "summary": "2-3 sentence personalized trip summary",
  "why_this_plan": "3-4 sentences on transport choice, timing decisions, and key recommendations",
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
          "time": "6:00 AM",
          "activity": "detailed activity description",
          "type": "travel|temple|food|stay|nature|heritage|shopping|leisure",
          "icon": "single emoji",
          "tip": "insider tip most travelers don't know",
          "booking_link": "URL or null",
          "duration_mins": 60
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string",
      "price_range": "₹1,500–₹2,000/night",
      "rating": 4.1,
      "tag": "Best Value",
      "booking_url": "https://www.makemytrip.com/hotels/",
      "address": "string"
    }
  ],
  "food_recommendations": ["specific dish at specific place with price range"],
  "practical_tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5", "tip 6"],
  "booking_links": {
    "train": "https://www.irctc.co.in/nget/train-search",
    "flight": null,
    "hotel": "https://www.makemytrip.com/hotels/",
    "bus": null
  },
  "route_highlights": ["notable stop on the way with brief reason to visit"],
  "best_time_to_visit": "string",
  "crowd_warning": "string or null",
  "weather_note": "string or null"
}`
}
