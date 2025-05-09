import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:conference.db'
});

// Initialize database with required tables
try {
  await db.execute('BEGIN');
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS conferences (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL DEFAULT 0,
      max_attendees INTEGER
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      organization TEXT NOT NULL,
      total_attendees INTEGER NOT NULL,
      total_amount NUMERIC NOT NULL,
      conference_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conference_id) REFERENCES conferences (id)
    );

    CREATE TABLE IF NOT EXISTS attendees (
      id TEXT PRIMARY KEY,
      registration_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      FOREIGN KEY (registration_id) REFERENCES registrations (id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS luncheon_events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      max_attendees INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS luncheon_registrations (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      district TEXT NOT NULL,
      department_location TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      group_size INTEGER NOT NULL,
      event_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES luncheon_events (id)
    );

    CREATE TABLE IF NOT EXISTS hall_of_fame_nominations (
      id TEXT PRIMARY KEY,
      supervisor_first_name TEXT NOT NULL,
      supervisor_last_name TEXT NOT NULL,
      supervisor_email TEXT NOT NULL,
      district TEXT NOT NULL,
      nominee_first_name TEXT NOT NULL,
      nominee_last_name TEXT NOT NULL,
      nominee_city TEXT NOT NULL,
      years_of_service INTEGER,
      region TEXT NOT NULL,
      is_tapt_member BOOLEAN NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS scholarship_applications (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      gender TEXT,
      is_us_citizen BOOLEAN,
      current_status TEXT,
      is_first_gen BOOLEAN,
      major TEXT,
      career_objective TEXT,
      high_school TEXT NOT NULL,
      school_district TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      gpa NUMERIC,
      activities TEXT,
      act_year INTEGER,
      act_score INTEGER,
      essay TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );
  `);

  await db.execute('COMMIT');

  // Insert sample conference if none exists
  const conferenceCount = await db.execute('SELECT COUNT(*) as count FROM conferences');
  if (conferenceCount.rows[0].count === 0) {
    await db.execute({
      sql: `
        INSERT INTO conferences (id, name, start_date, end_date, location, description, price, max_attendees)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        'conf-2025',
        '2025 TAPT Conference & Trade Show',
        '2025-06-02',
        '2025-06-04',
        'Music Road Hotel, Pigeon Forge-Gatlinburg',
        'Join us for the annual Tennessee Association of Pupil Transportation Conference and Trade Show.',
        175.00,
        200
      ]
    });
  }

  // Insert sample luncheon events if none exist
  const luncheonCount = await db.execute('SELECT COUNT(*) as count FROM luncheon_events');
  if (luncheonCount.rows[0].count === 0) {
    const events = [
      {
        id: 'lunch-1',
        date: '2025-04-25',
        time: '10:30 AM',
        location: "Logan's Roadhouse",
        city: 'Cookeville',
        address: '1395 Interstate Dr, Cookeville, TN 38501',
        max_attendees: 50
      },
      {
        id: 'lunch-2',
        date: '2025-05-01',
        time: '10:00 AM',
        location: 'Greene Technical Center',
        city: 'Greeneville',
        address: '1121 Hal Henard Rd, Greeneville, TN 37743',
        max_attendees: 50,
        notes: 'Catered by Top Choice BBQ'
      },
      {
        id: 'lunch-3',
        date: '2025-05-02',
        time: '10:00 AM',
        location: "Calhoun's at the Marina",
        city: 'Lenoir City',
        address: '4550 City Park Dr, Lenoir City, TN 37772',
        max_attendees: 50
      }
    ];

    for (const event of events) {
      await db.execute({
        sql: `
          INSERT INTO luncheon_events (id, date, time, location, city, address, max_attendees, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          event.id,
          event.date,
          event.time,
          event.location,
          event.city,
          event.address,
          event.max_attendees,
          event.notes || null
        ]
      });
    }
  }
} catch (error) {
  await db.execute('ROLLBACK');
  console.error('Database initialization error:', error);
  throw error;
}

export const getLatestConference = async () => {
  const result = await db.execute('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1');
  return result.rows[0];
};

export const createRegistration = async (data) => {
  const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  // Begin transaction
  await db.execute('BEGIN');

  try {
    // Insert registration
    await db.execute({
      sql: `
        INSERT INTO registrations (id, organization, total_attendees, total_amount, conference_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        registrationId,
        data.organization,
        data.attendees.length,
        data.totalAmount,
        'conf-2025'
      ]
    });

    // Insert attendees
    for (let i = 0; i < data.attendees.length; i++) {
      const attendee = data.attendees[i];
      const attendeeId = `att-${registrationId}-${i + 1}`;
      await db.execute({
        sql: `
          INSERT INTO attendees (id, registration_id, first_name, last_name)
          VALUES (?, ?, ?, ?)
        `,
        args: [
          attendeeId,
          registrationId,
          attendee.firstName,
          attendee.lastName
        ]
      });
    }

    // Commit transaction
    await db.execute('COMMIT');
    return { id: registrationId };
  } catch (error) {
    // Rollback on error
    await db.execute('ROLLBACK');
    throw error;
  }
};

export const createLuncheonRegistration = async (data) => {
  const id = 'lunch-reg-' + Math.random().toString(36).substr(2, 9);
  
  const [city, location] = data.location.split('-');
  const event = await db.execute({
    sql: 'SELECT id FROM luncheon_events WHERE location = ? AND city = ?',
    args: [location, city]
  });

  if (!event.rows[0]) {
    throw new Error('Invalid luncheon event selected');
  }

  await db.execute({
    sql: `
      INSERT INTO luncheon_registrations (
        id, first_name, last_name, job_title, district,
        department_location, email, phone, group_size, event_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      data.firstName,
      data.lastName,
      data.jobTitle,
      data.district,
      data.departmentLocation,
      data.email,
      data.phone,
      data.groupSize,
      event.rows[0].id
    ]
  });

  return { id };
};

export const createHallOfFameNomination = async (data) => {
  const id = 'hof-' + Math.random().toString(36).substr(2, 9);

  await db.execute({
    sql: `
      INSERT INTO hall_of_fame_nominations (
        id, supervisor_first_name, supervisor_last_name, supervisor_email,
        district, nominee_first_name, nominee_last_name, nominee_city,
        years_of_service, region, is_tapt_member
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
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
    ]
  });

  return { id };
};

export const createScholarshipApplication = async (data) => {
  const id = 'scholar-' + Math.random().toString(36).substr(2, 9);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const birthDate = `${data.birthYear}-${String(months.indexOf(data.birthMonth) + 1).padStart(2, '0')}-${String(data.birthDay).padStart(2, '0')}`;

  await db.execute({
    sql: `
      INSERT INTO scholarship_applications (
        id, first_name, last_name, birth_date, email, phone,
        address, city, state, zip, gender, is_us_citizen,
        current_status, is_first_gen, major, career_objective,
        high_school, school_district, graduation_year, gpa,
        activities, act_year, act_score, essay
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
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
    ]
  });

  return { id };
};

export const authenticateUser = async (email: string, password: string) => {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ? AND password = ?',
    args: [email, password] // Note: In production, use proper password hashing
  });
  
  return result.rows[0] || null;
};