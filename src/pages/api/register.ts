import type { APIRoute } from 'astro';
import { createRegistration } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error('Empty request body received');
      return new Response(
        JSON.stringify({ error: 'Empty request body' }), 
        { status: 400, headers }
      );
    }

    let data;
    try {
      data = await request.json();
      console.log('Received registration data:', data);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers }
      );
    }

    if (!data || typeof data !== 'object') {
      console.error('Invalid data format received:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }), 
        { status: 400, headers }
      );
    }

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

      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !attendee[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required attendee fields:', missingFields);
        return new Response(
          JSON.stringify({ error: `Missing required fields for attendee: ${missingFields.join(', ')}` }), 
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

    console.log('Processing registration with data:', data);
    const registration = await createRegistration(data);
    
    if (!registration) {
      console.error('Registration creation failed - no data returned');
      return new Response(
        JSON.stringify({ error: 'Failed to create registration' }), 
        { status: 500, headers }
      );
    }

    console.log('Registration created successfully:', registration);
    return new Response(
      JSON.stringify({ success: true, data: registration }), 
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during registration';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }), 
      { status: 500, headers }
    );
  }
};