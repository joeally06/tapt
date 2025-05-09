import type { APIRoute } from 'astro';
import { createHallOfFameNomination } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const data = await request.json();
    const result = await createHallOfFameNomination(data);

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