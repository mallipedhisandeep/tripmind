import { TripForm, GeneratedPlan } from '@/types'

// gemini-2.0-flash has 15 RPM free tier
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

async function callGemini(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (response.status === 429) {
      // Wait before retrying: 5s, 10s, 20s
      const wait = (i + 1) * 5000
      await new Promise(r => setTimeout(r, wait))
      continue
    }

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response from Gemini')
    return text
  }
  throw new Error('Gemini API rate limit. Please try again in 1 minute.')
}

export async function generateTripPlan(form: TripForm, userPreferences?: string): Promise<GeneratedPlan> {
  const prompt = buildPrompt(form, userPreferences)
  const text = await callGemini(prompt)

  // Clean and parse JSON
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const plan: GeneratedPlan = JSON.parse(cleaned)
    return plan
  } catch (e) {
    // Try to extract JSON if there's extra text
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
    budget: 'under ₹5,000/person',
    moderate: '₹5,000–₹15,000/person',
    comfortable: '₹15,000–₹30,000/person',
    premium: 'above ₹30,000/person',
  }

  return `You are TripMind, an expert Indian travel planner. Generate a practical trip plan.

TRIP:
From: ${form.from} | To: ${form.to} | Days: ${form.days}
Travelers: ${form.travelers} | Group: ${groupLabel[form.group_type] || form.group_type}
Budget: ${budgetLabel[form.budget] || form.budget}
Interests: ${form.interests.join(', ')}
Transport: ${form.transport}
${form.special_notes ? `Notes: ${form.special_notes}` : ''}
${userPreferences ? `User preferences: ${userPreferences}` : ''}

Return ONLY valid JSON, no markdown, no extra text:
{
  "destination": "string",
  "from": "string",
  "days": number,
  "summary": "2-3 sentence trip summary",
  "why_this_plan": "2-3 sentences on transport and timing choices",
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
          "activity": "specific activity name",
          "type": "travel|temple|food|stay|nature|heritage|shopping|leisure",
          "icon": "emoji",
          "tip": "insider tip",
          "booking_link": null,
          "duration_mins": 60
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string",
      "price_range": "₹1,500–₹2,000/night",
      "rating": 4.0,
      "tag": "Best Value",
      "booking_url": "https://www.makemytrip.com/hotels/",
      "address": "string"
    }
  ],
  "food_recommendations": ["dish at place - price range"],
  "practical_tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "booking_links": {
    "train": "https://www.irctc.co.in/nget/train-search",
    "flight": null,
    "hotel": "https://www.makemytrip.com/hotels/",
    "bus": null
  },
  "route_highlights": ["place on the way"],
  "best_time_to_visit": "string",
  "crowd_warning": null,
  "weather_note": null
}`
}
