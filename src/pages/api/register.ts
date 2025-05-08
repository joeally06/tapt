import type { APIRoute } from 'astro';
import { createRegistration } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const data = await request.json();
    console.log('Received registration data:', data); // Debug log

    // Validate required fields
    if (!data.organization) {
      console.error('Missing organization field');
      return new Response(
        JSON.stringify({ error: 'Organization is required' }), 
        { status: 400, headers }
      );
    }

    if (!data.attendees || !Array.isArray(data.attendees) || data.attendees.length === 0) {
      console.error('Invalid or missing attendees:', data.attendees);
      return new Response(
        JSON.stringify({ error: 'At least one attendee is required' }), 
        { status: 400, headers }
      );
    }

    // Validate each attendee has required fields
    for (const attendee of data.attendees) {
      if (!attendee || typeof attendee !== 'object') {
        console.error('Invalid attendee data format:', attendee);
        return new Response(
          JSON.stringify({ error: 'Invalid attendee data format' }), 
          { status: 400, headers }
        );
      }

      if (!attendee.firstName || !attendee.lastName) {
        console.error('Missing required attendee fields:', attendee);
        return new Response(
          JSON.stringify({ error: 'First name and last name are required for all attendees' }), 
          { status: 400, headers }
        );
      }
    }

    if (typeof data.totalAmount !== 'number' || data.totalAmount <= 0) {
      console.error('Invalid total amount:', data.totalAmount);
      return new Response(
        JSON.stringify({ error: 'Invalid total amount' }), 
        { status: 400, headers }
      );
    }

    console.log('Processing registration with data:', data); // Debug log
    const registration = await createRegistration(data);
    console.log('Registration created:', registration); // Debug log

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