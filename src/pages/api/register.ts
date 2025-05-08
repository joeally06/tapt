import type { APIRoute } from 'astro';
import { createRegistration } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    let data;
    try {
      const text = await request.text();
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON data provided' }), 
        { status: 400, headers }
      );
    }
    
    // Validate required fields
    if (!data.organization) {
      return new Response(
        JSON.stringify({ error: 'Organization is required' }), 
        { status: 400, headers }
      );
    }

    if (!data.attendees || !Array.isArray(data.attendees) || data.attendees.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one attendee is required' }), 
        { status: 400, headers }
      );
    }

    // Validate each attendee has required fields
    for (const attendee of data.attendees) {
      if (!attendee || typeof attendee !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Invalid attendee data format' }), 
          { status: 400, headers }
        );
      }

      if (!attendee.firstName || !attendee.lastName) {
        return new Response(
          JSON.stringify({ error: 'First name and last name are required for all attendees' }), 
          { status: 400, headers }
        );
      }
    }

    if (typeof data.totalAmount !== 'number' || data.totalAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid total amount' }), 
        { status: 400, headers }
      );
    }

    const registration = await createRegistration(data);

    return new Response(
      JSON.stringify({ success: true, data: registration }), 
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during registration' 
      }), 
      { status: 500, headers }
    );
  }
};