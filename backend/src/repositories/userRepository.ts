import pool from '../config/db';
import { User } from '../models/user';

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

export const findUserByIdentifier = async (identifier: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 OR name = $1', [identifier]);
    return result.rows[0] || null;
};

export const createUser = async (name: string, email: string, passwordHash: string, roleId: number): Promise<User> => {
    const result = await pool.query(
        'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, passwordHash, roleId]
    );
    return result.rows[0];
};

export const findUserById = async (id: number): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};
