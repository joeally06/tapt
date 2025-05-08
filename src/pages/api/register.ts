import type { APIRoute } from 'astro';
import { createRegistration } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    let data;
    try {
      data = await request.json();
    } catch (e) {
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

    if (!data.attendees || !data.attendees.length) {
      return new Response(
        JSON.stringify({ error: 'At least one attendee is required' }), 
        { status: 400, headers }
      );
    }

    // Validate each attendee has required fields
    for (const attendee of data.attendees) {
      if (!attendee.firstName || !attendee.lastName) {
        return new Response(
          JSON.stringify({ error: 'First name and last name are required for all attendees' }), 
          { status: 400, headers }
        );
      }
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