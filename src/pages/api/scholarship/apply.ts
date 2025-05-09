import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    const data = await request.json();
    
    // Combine birth date components
    const birthDate = `${data.birthYear}-${String(months.indexOf(data.birthMonth) + 1).padStart(2, '0')}-${String(data.birthDay).padStart(2, '0')}`;

    const result = db.prepare(`
      INSERT INTO scholarship_applications (
        first_name,
        last_name,
        birth_date,
        email,
        phone,
        address,
        city,
        state,
        zip,
        gender,
        is_us_citizen,
        current_status,
        is_first_gen,
        major,
        career_objective,
        high_school,
        school_district,
        graduation_year,
        gpa,
        activities,
        act_year,
        act_score,
        essay
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.firstName,
      data.lastName,
      birthDate,
      data.email,
      data.mobile,
      data.address1 + (data.address2 ? ' ' + data.address2 : ''),
      data.city,
      'TN',
      data.zipCode,
      data.gender || null,
      data.usCitizen === 'yes',
      data.currentStatus || null,
      data.firstGen === 'yes',
      data.major || null,
      data.careerObjective || null,
      data.highSchool,
      data.schoolDistrict,
      data.graduationYear,
      data.gpa || null,
      data.activities || null,
      data.actYear || null,
      data.actScore || null,
      data.essay
    );

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Application error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
}