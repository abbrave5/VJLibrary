const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./scores.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    arranger TEXT,
    style TEXT,
    tempo TEXT,
    filename TEXT
  )`);
});

module.exports = db;
