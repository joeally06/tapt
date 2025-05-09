import Database from 'better-sqlite3';

const db = new Database('conference.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with required tables
db.exec(`
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

// Insert sample conference if none exists
const conferenceCount = db.prepare('SELECT COUNT(*) as count FROM conferences').get();
if (conferenceCount.count === 0) {
  db.prepare(`
    INSERT INTO conferences (id, name, start_date, end_date, location, description, price, max_attendees)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'conf-2025',
    '2025 TAPT Conference & Trade Show',
    '2025-06-02',
    '2025-06-04',
    'Music Road Hotel, Pigeon Forge-Gatlinburg',
    'Join us for the annual Tennessee Association of Pupil Transportation Conference and Trade Show.',
    175.00,
    200
  );
}

export const getLatestConference = () => {
  return db.prepare('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1').get();
};

export const createRegistration = (data) => {
  const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  const insertRegistration = db.prepare(`
    INSERT INTO registrations (id, organization, total_attendees, total_amount, conference_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertAttendee = db.prepare(`
    INSERT INTO attendees (id, registration_id, first_name, last_name, email, phone, address, city, state, zip)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((data) => {
    insertRegistration.run(
      registrationId,
      data.organization,
      data.attendees.length,
      data.totalAmount,
      'conf-2025'
    );

    data.attendees.forEach((attendee, index) => {
      const attendeeId = `att-${registrationId}-${index + 1}`;
      insertAttendee.run(
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
      );
    });

    return { id: registrationId };
  });

  return transaction(data);
};

export { db }