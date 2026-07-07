const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ตั้งค่าเชื่อมต่อ Database ผ่าน Environment Variables (ห้าม Hardcode)
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'compuroom',
  port: process.env.DB_PORT || 5432,
});

// 1. GET /health (เช็กสถานะระบบ - โจทย์สั่งต้องมี)
app.get('/health', (req, res) => {
  res.json({ status: 'UP', version: '1.0.0' });
});

// 2. GET /api/compuroom (ดูข้อมูลทั้งหมด)
app.get('/api/compuroom', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compurooms ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/compuroom/:id (ดูข้อมูลรายเครื่อง)
app.get('/api/compuroom/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM compurooms WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/compuroom (เพิ่มข้อมูลคอมพิวเตอร์)
app.post('/api/compuroom', async (req, res) => {
  try {
    const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;
    const result = await pool.query(
      'INSERT INTO compurooms (asset_code, brand_model, cpu, ram_gb, room, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [asset_code, brand_model, cpu, ram_gb, room, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT /api/compuroom/:id (แก้ไขข้อมูล)
app.put('/api/compuroom/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;
    const result = await pool.query(
      'UPDATE compurooms SET asset_code=$1, brand_model=$2, cpu=$3, ram_gb=$4, room=$5, status=$6 WHERE id=$7 RETURNING *',
      [asset_code, brand_model, cpu, ram_gb, room, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE /api/compuroom/:id (ลบข้อมูล)
app.delete('/api/compuroom/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM compurooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});