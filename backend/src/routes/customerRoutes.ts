import { Router } from 'express';
import pool from '../config/db';

const router = Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create a customer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, account_type, start_date, expiry_date, balance, status } = req.body;
        const result = await pool.query(
            'INSERT INTO customers (name, email, phone, account_type, start_date, expiry_date, balance, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, email, phone, account_type, start_date, expiry_date, balance || 0, status || 'Active']
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Customer deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
