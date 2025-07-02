const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/pdfs', express.static(path.join(__dirname, 'pdfs')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'pdfs'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.get('/api/scores', (req, res) => {
  const query = req.query.q;

  console.log("Incoming GET /scores with query:", query);

  if (!query || query.trim() === '') {
    console.log("No query provided — returning all scores");

    db.all(`SELECT * FROM scores ORDER BY id DESC`, [], (err, rows) => {
      if (err) {
        console.error("Error fetching all scores:", err);
        return res.status(500).send(err);
      }
      console.log("Returning", rows.length, "scores");
      return res.json(rows);
    });
  } else {
    console.log("Search query:", query);

    const sql = `
      SELECT * FROM scores
      WHERE title LIKE ? OR arranger LIKE ? OR style LIKE ? OR tempo LIKE ?
    `;
    const param = `%${query}%`;

    db.all(sql, [param, param, param, param], (err, rows) => {
      if (err) {
        console.error("Error searching scores:", err);
        return res.status(500).send(err);
      }
      console.log("Search returned", rows.length, "scores");
      res.json(rows);
    });
  }
});



app.post('/api/upload', upload.single('pdf'), (req, res) => {
  const { title, arranger, style, tempo } = req.body;
  const filename = req.file.filename;

  db.run(`INSERT INTO scores (title, arranger, style, tempo, filename) VALUES (?, ?, ?, ?, ?)`,
    [title, arranger, style, tempo, filename], function (err) {
      if (err) return res.status(500).send(err);
      res.json({ id: this.lastID });
    });
});

app.delete('/api/scores/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT filename FROM scores WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).send('Score not found');
    fs.unlinkSync(`pdfs/${row.filename}`);
    db.run(`DELETE FROM scores WHERE id = ?`, [id], err => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



