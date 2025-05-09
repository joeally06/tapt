import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:conference.db',
});

// Initialize database with required tables
const initDb = async () => {
  try {
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
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip TEXT NOT NULL,
        FOREIGN KEY (registration_id) REFERENCES registrations (id)
      );

      CREATE TABLE IF NOT EXISTS luncheon_events (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
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

    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Insert sample conference if none exists
const insertSampleConference = async () => {
  try {
    const result = await db.execute('SELECT COUNT(*) as count FROM conferences');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      console.log('No conferences found, inserting sample conference...');
      await db.execute(`
        INSERT INTO conferences (id, name, start_date, end_date, location, description, price, max_attendees)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'conf-2025',
        '2025 TAPT Conference & Trade Show',
        '2025-06-02',
        '2025-06-04',
        'Music Road Hotel, Pigeon Forge-Gatlinburg',
        'Join us for the annual Tennessee Association of Pupil Transportation Conference and Trade Show.',
        175.00,
        200
      ]);
      console.log('Sample conference inserted successfully');
    } else {
      console.log('Conference data already exists');
    }
  } catch (error) {
    console.error('Error inserting sample conference:', error);
    throw error;
  }
};

// Initialize database and insert sample data
const initialize = async () => {
  try {
    await initDb();
    await insertSampleConference();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Run initialization
initialize().catch(console.error);

export const getLatestConference = async () => {
  try {
    const result = await db.execute('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1');
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting latest conference:', error);
    throw error;
  }
};

export const createRegistration = async (data: any) => {
  const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  try {
    await db.transaction(async (tx) => {
      // Insert registration
      await tx.execute(`
        INSERT INTO registrations (id, organization, total_attendees, total_amount, conference_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        registrationId,
        data.organization,
        data.attendees.length,
        data.totalAmount,
        'conf-2025'
      ]);

      // Insert attendees
      for (let i = 0; i < data.attendees.length; i++) {
        const attendee = data.attendees[i];
        const attendeeId = `att-${registrationId}-${i + 1}`;
        
        await tx.execute(`
          INSERT INTO attendees (id, registration_id, first_name, last_name, email, phone, address, city, state, zip)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          attendeeId,
          registrationId,
          attendee.firstName,
          attendee.lastName,
          attendee.email,
          attendee.phone,
          attendee.address,
          attendee.city,
          attendee.state,
          attendee.zip
        ]);
      }
    });

    return { id: registrationId };
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
};

export { db };