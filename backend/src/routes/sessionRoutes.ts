import { Router } from 'express';
import pool from '../config/db';

const router = Router();

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM parking_sessions ORDER BY entry_time DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create a session (Entry)
router.post('/', async (req, res) => {
    try {
        const { session_id, vehicle_plate, carpark_id } = req.body;
        const result = await pool.query(
            'INSERT INTO parking_sessions (session_id, vehicle_plate, carpark_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [session_id, vehicle_plate, carpark_id, 'Active']
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Complete a session (Exit)
router.put('/:id/exit', async (req, res) => {
    try {
        const { cost, duration } = req.body;
        const result = await pool.query(
            "UPDATE parking_sessions SET exit_time = CURRENT_TIMESTAMP, duration = $1, cost = $2, status = 'Completed' WHERE id = $3 RETURNING *",
            [duration, cost, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
