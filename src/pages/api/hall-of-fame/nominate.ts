import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const data = await request.json();

    const result = db.prepare(`
      INSERT INTO hall_of_fame_nominations (
        supervisor_first_name,
        supervisor_last_name,
        supervisor_email,
        district,
        nominee_first_name,
        nominee_last_name,
        nominee_city,
        years_of_service,
        region,
        is_tapt_member
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.supervisorFirstName,
      data.supervisorLastName,
      data.supervisorEmail,
      data.district,
      data.nomineeFirstName,
      data.nomineeLastName,
      data.nomineeCity,
      data.yearsOfService || null,
      data.region,
      data.isTAPTMember === 'yes'
    );

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Nomination error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
}