import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendWhatsApp,
  trainSeatMsg,
  hotelPriceMsg,
  darshanSlotMsg,
  flightPriceMsg,
} from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient()

  const { data: items, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('active', true)
    .eq('notified', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!items || items.length === 0) return NextResponse.json({ checked: 0 })

  let notified = 0

  for (const item of items) {
    await supabase
      .from('watchlist')
      .update({ last_checked_at: new Date().toISOString() })
      .eq('id', item.id)

    if (!item.whatsapp_number) continue

    const isAvailable = await checkAvailability(item.type, item.params, item.target_price)

    if (isAvailable) {
      let msg = ''
      switch (item.type) {
        case 'train_seat':
          msg = trainSeatMsg(item.label, item.params.train_no, item.params.date, item.params.class)
          break
        case 'hotel_price':
          msg = hotelPriceMsg(item.label, item.params.hotel_name, item.params.current_price)
          break
        case 'darshan_slot':
          msg = darshanSlotMsg(item.label, item.params.temple, item.params.date)
          break
        case 'flight_price':
          msg = flightPriceMsg(item.label, item.params.route, item.params.current_price)
          break
        default:
          msg = `🔔 TripMind: Alert triggered for "${item.label}"`
      }

      try {
        await sendWhatsApp(item.whatsapp_number, msg)
        // Mark notified; reset to false when the user wants recurring alerts
        await supabase.from('watchlist').update({ notified: true }).eq('id', item.id)
        notified++
      } catch (e) {
        console.error('WhatsApp send failed', item.id, e)
      }
    }
  }

  return NextResponse.json({ checked: items.length, notified })
}

/**
 * Replace each case with a real API call before enabling in production.
 * Gate behind AVAILABILITY_CHECK_ENABLED=true to prevent random alerts in dev/staging.
 *
 * train_seat   → IRCTC / RailConnect API
 * darshan_slot → temple booking site scraper / API
 * hotel_price  → MakeMyTrip / Goibibo API
 * flight_price → Skyscanner / Amadeus API
 * bus_seat     → redBus API
 */
async function checkAvailability(
  type: string,
  params: Record<string, any>,
  targetPrice?: number
): Promise<boolean> {
  if (process.env.AVAILABILITY_CHECK_ENABLED !== 'true') {
    return false
  }

  // TODO: replace stubs below with real API integrations
  switch (type) {
    case 'train_seat':
      // e.g. return await irctcCheckAvailability(params)
      return false
    case 'darshan_slot':
      // e.g. return await templeCheckSlot(params)
      return false
    case 'hotel_price':
      // e.g. return await hotelCheckPrice(params, targetPrice)
      return false
    case 'flight_price':
      // e.g. return await flightCheckPrice(params, targetPrice)
      return false
    default:
      return false
  }
}
