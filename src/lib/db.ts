import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:conference.db',
});

// Initialize database with required tables
await client.execute(`
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
`);

// Insert sample conference if none exists
const conferenceCount = await client.execute('SELECT COUNT(*) as count FROM conferences');
if (conferenceCount.rows[0].count === 0) {
  await client.execute(`
    INSERT INTO conferences (id, name, start_date, end_date, location, description, price, max_attendees)
    VALUES (
      'conf-2025',
      '2025 TAPT Conference & Trade Show',
      '2025-06-02',
      '2025-06-04',
      'Music Road Hotel, Pigeon Forge-Gatlinburg',
      'Join us for the annual Tennessee Association of Pupil Transportation Conference and Trade Show.',
      175.00,
      200
    )
  `);
}

export const getLatestConference = async () => {
  const result = await client.execute('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1');
  return result.rows[0];
};

export const createRegistration = async (data) => {
  const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  await client.transaction(async (tx) => {
    // Create registration
    await tx.execute(`
      INSERT INTO registrations (id, organization, total_attendees, total_amount, conference_id)
      VALUES (?, ?, ?, ?, ?)
    `, [registrationId, data.organization, data.attendees.length, data.totalAmount, 'conf-2025']);

    // Create attendees
    for (let i = 0; i < data.attendees.length; i++) {
      const attendee = data.attendees[i];
      const attendeeId = `att-${registrationId}-${i + 1}`;
      await tx.execute(`
        INSERT INTO attendees (id, registration_id, first_name, last_name)
        VALUES (?, ?, ?, ?)
      `, [attendeeId, registrationId, attendee.firstName, attendee.lastName]);
    }
  });

  return { id: registrationId };
};