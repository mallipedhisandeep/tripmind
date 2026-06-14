/**
 * WhatsApp notifications via Twilio (or Meta Cloud API).
 * Replace TWILIO_* env vars with your real credentials.
 * Meta Cloud API: set WHATSAPP_PROVIDER=meta and fill META_* vars.
 */

const PROVIDER = process.env.WHATSAPP_PROVIDER ?? 'twilio' // 'twilio' | 'meta'

// ── Twilio ────────────────────────────────────────────────────
const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID   ?? 'PLACEHOLDER_SID'
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN     ?? 'PLACEHOLDER_TOKEN'
const TWILIO_FROM  = process.env.TWILIO_WHATSAPP_FROM  ?? 'whatsapp:+14155238886'

// ── Meta Cloud API ────────────────────────────────────────────
const META_TOKEN   = process.env.META_WHATSAPP_TOKEN   ?? 'PLACEHOLDER_META_TOKEN'
const META_PHONE_ID = process.env.META_PHONE_NUMBER_ID ?? 'PLACEHOLDER_PHONE_ID'

async function sendViaTwilio(to: string, body: string): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: TWILIO_FROM,
      To: `whatsapp:${to}`,
      Body: body,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Twilio error: ${err}`)
  }
}

async function sendViaMeta(to: string, body: string): Promise<void> {
  const url = `https://graph.facebook.com/v19.0/${META_PHONE_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${META_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace('+', ''),
      type: 'text',
      text: { body },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta WA error: ${err}`)
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (PROVIDER === 'meta') {
    await sendViaMeta(to, body)
  } else {
    await sendViaTwilio(to, body)
  }
}

// Pre-built messages
export function trainSeatMsg(label: string, trainNo: string, date: string, cls: string) {
  return `🚆 *TripMind Alert*\nSeat available! ${label}\nTrain: ${trainNo} | Date: ${date} | Class: ${cls}\nBook now on IRCTC before it fills up!`
}

export function hotelPriceMsg(label: string, hotel: string, price: number) {
  return `🏨 *TripMind Alert*\nPrice dropped! ${label}\nHotel: ${hotel} is now ₹${price}/night\nBook now!`
}

export function darshanSlotMsg(label: string, temple: string, date: string) {
  return `🛕 *TripMind Alert*\nDarshan slot opened! ${label}\nTemple: ${temple} | Date: ${date}\nBook your slot now!`
}

export function flightPriceMsg(label: string, route: string, price: number) {
  return `✈️ *TripMind Alert*\nFlight price dropped! ${label}\nRoute: ${route} is now ₹${price}\nBook now!`
}
