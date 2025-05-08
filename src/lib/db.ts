import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../data/conference.db');

const db = new Database(dbPath);

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
    FOREIGN KEY (registration_id) REFERENCES registrations (id)
  );
`);

// Insert sample conference if none exists
const conferenceCount = db.prepare('SELECT COUNT(*) as count FROM conferences').get();
if (conferenceCount.count === 0) {
  db.prepare(`
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
  `).run();
}

export const getLatestConference = () => {
  return db.prepare('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1').get();
};

export const createRegistration = (data) => {
  const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  db.transaction(() => {
    // Create registration
    db.prepare(`
      INSERT INTO registrations (id, organization, total_attendees, total_amount, conference_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      registrationId,
      data.organization,
      data.attendees.length,
      data.totalAmount,
      'conf-2025'
    );

    // Create attendees
    const insertAttendee = db.prepare(`
      INSERT INTO attendees (id, registration_id, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `);

    data.attendees.forEach((attendee, index) => {
      const attendeeId = `att-${registrationId}-${index + 1}`;
      insertAttendee.run(
        attendeeId,
        registrationId,
        attendee.firstName,
        attendee.lastName
      );
    });
  })();

  return { id: registrationId };
};