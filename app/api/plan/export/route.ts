import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeneratedPlan, TripForm } from '@/types'

function escHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeFilename(s: unknown): string {
  return String(s ?? 'trip').replace(/[^a-zA-Z0-9\-_ ]/g, '').trim() || 'trip'
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trip_id } = await req.json()
  if (!trip_id) return NextResponse.json({ error: 'trip_id required' }, { status: 400 })

  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', trip_id)
    .eq('user_id', user.id)
    .single()

  if (error || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  const plan: GeneratedPlan = trip.generated_plan
  const form: TripForm      = trip.form_data

  const html = buildPlanHtml(plan, form)
  const filename = safeFilename(plan.destination)

  let browser: any = null

  try {
    const chromium  = (await import('@sparticuz/chromium')).default
    const puppeteer = (await import('puppeteer-core')).default

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tripmind-${filename}.pdf"`,
      },
    })
  } catch {
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="tripmind-${filename}.html"`,
      },
    })
  } finally {
    if (browser) {
      try { await browser.close() } catch { /* ignore */ }
    }
  }
}

function buildPlanHtml(plan: GeneratedPlan, form: TripForm): string {
  const days = plan.days_plan?.map(day => `
    <div class="day">
      <h3>Day ${escHtml(day.day)} — ${escHtml(day.date)}: ${escHtml(day.title)}</h3>
      <table>
        <thead><tr><th>Time</th><th>Activity</th><th>Tip</th></tr></thead>
        <tbody>
          ${day.slots.map(s => `
            <tr>
              <td>${escHtml(s.time)}</td>
              <td>${escHtml(s.icon)} ${escHtml(s.activity)}</td>
              <td>${escHtml(s.tip)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('') ?? ''

  const tips = plan.practical_tips?.map(t => `<li>${escHtml(t)}</li>`).join('') ?? ''
  const food = plan.food_recommendations?.map(f => `<li>${escHtml(f)}</li>`).join('') ?? ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    header { background: linear-gradient(135deg, #f97316, #fb923c); color: white; padding: 32px; }
    header h1 { font-size: 28px; margin-bottom: 4px; }
    header p  { font-size: 14px; opacity: 0.9; }
    .section  { padding: 24px 32px; border-bottom: 1px solid #e5e7eb; }
    .section h2 { font-size: 18px; color: #f97316; margin-bottom: 12px; }
    .badges  { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .badge   { background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; padding: 4px 12px; border-radius: 999px; font-size: 13px; }
    .budget-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .budget-box  { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .budget-box .label { font-size: 12px; color: #6b7280; }
    .budget-box .value { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .day  { margin-bottom: 24px; }
    .day h3 { font-size: 15px; font-weight: 700; color: #374151; margin-bottom: 8px; padding: 8px 12px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th    { background: #f3f4f6; padding: 8px; text-align: left; border: 1px solid #e5e7eb; }
    td    { padding: 8px; border: 1px solid #e5e7eb; vertical-align: top; }
    ul    { padding-left: 20px; }
    li    { margin-bottom: 4px; font-size: 13px; }
    footer { text-align: center; padding: 16px; font-size: 12px; color: #9ca3af; }
    .warn { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <h1>🗺️ ${escHtml(plan.destination)} Trip Plan</h1>
    <p>${escHtml(form.from)} → ${escHtml(plan.destination)} · ${escHtml(plan.days)} days · Generated by TripMind</p>
  </header>

  <div class="section">
    <h2>Overview</h2>
    <p>${escHtml(plan.summary)}</p>
    <div class="badges" style="margin-top:12px;">
      <span class="badge">👥 ${escHtml(form.travelers)} travellers</span>
      <span class="badge">💼 ${escHtml(form.budget)}</span>
      <span class="badge">🚂 ${escHtml(form.transport)}</span>
    </div>
    ${plan.crowd_warning ? `<div class="warn">⚠️ ${escHtml(plan.crowd_warning)}</div>` : ''}
    ${plan.weather_note  ? `<div class="warn">🌤️ ${escHtml(plan.weather_note)}</div>`  : ''}
  </div>

  <div class="section">
    <h2>Budget Estimate</h2>
    <div class="budget-grid">
      <div class="budget-box"><div class="label">Total (min)</div><div class="value">₹${escHtml(plan.total_budget_min?.toLocaleString('en-IN'))}</div></div>
      <div class="budget-box"><div class="label">Total (max)</div><div class="value">₹${escHtml(plan.total_budget_max?.toLocaleString('en-IN'))}</div></div>
      <div class="budget-box"><div class="label">Transport</div><div class="value">₹${escHtml(plan.budget_breakdown?.transport?.toLocaleString('en-IN'))}</div></div>
      <div class="budget-box"><div class="label">Stay</div><div class="value">₹${escHtml(plan.budget_breakdown?.accommodation?.toLocaleString('en-IN'))}</div></div>
      <div class="budget-box"><div class="label">Food</div><div class="value">₹${escHtml(plan.budget_breakdown?.food?.toLocaleString('en-IN'))}</div></div>
      <div class="budget-box"><div class="label">Activities</div><div class="value">₹${escHtml(plan.budget_breakdown?.activities?.toLocaleString('en-IN'))}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Day-by-Day Itinerary</h2>
    ${days}
  </div>

  <div class="section">
    <h2>Food Recommendations</h2>
    <ul>${food}</ul>
  </div>

  <div class="section">
    <h2>Practical Tips</h2>
    <ul>${tips}</ul>
  </div>

  <footer>Generated by TripMind · India's Travel Intelligence System</footer>
</body>
</html>`
}
