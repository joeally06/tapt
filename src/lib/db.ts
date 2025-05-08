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
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT NOT NULL,
    dietary TEXT,
    conference_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences (id)
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
      'Join us for the annual Tennessee Association of Pupil Transportation Conference and Trade Show. Network with peers, attend educational sessions, and explore the latest in pupil transportation.',
      299.99,
      200
    )
  `).run();
}

export const getLatestConference = () => {
  return db.prepare('SELECT * FROM conferences ORDER BY start_date ASC LIMIT 1').get();
};

export const createRegistration = (registration) => {
  const stmt = db.prepare(`
    INSERT INTO registrations (id, first_name, last_name, email, organization, dietary, conference_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = 'reg-' + Math.random().toString(36).substr(2, 9);
  
  return stmt.run(
    id,
    registration.firstName,
    registration.lastName,
    registration.email,
    registration.organization,
    registration.dietary || null,
    registration.conferenceId
  );
};