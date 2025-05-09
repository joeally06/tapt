import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const data = await request.json();

    // First get the event ID based on location
    const [city, location] = data.location.split('-');
    const event = db.prepare(`
      SELECT id FROM luncheon_events 
      WHERE location = ? AND city = ?
    `).get(location, city);

    if (!event) {
      throw new Error('Invalid luncheon event selected');
    }

    const result = db.prepare(`
      INSERT INTO luncheon_registrations (
        first_name,
        last_name,
        job_title,
        district,
        department_location,
        email,
        phone,
        group_size,
        event_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.firstName,
      data.lastName,
      data.jobTitle,
      data.district,
      data.departmentLocation,
      data.email,
      data.phone,
      data.groupSize,
      event.id
    );

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
}