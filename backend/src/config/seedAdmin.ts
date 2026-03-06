import bcrypt from 'bcrypt';
import pool from './db';

const seedAdmin = async () => {
    try {
        const identifier = 'admin';
        const email = 'admin@carpark.com';
        const password = 'admin';

        // Find if user exists
        const check = await pool.query('SELECT * FROM users WHERE name = $1', [identifier]);
        if (check.rows.length > 0) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4)',
            [identifier, email, passwordHash, 1]
        );
        console.log('Admin user perfectly created! (Username: admin, Password: admin)');
    } catch (err) {
        console.error('Error seeding admin', err);
    } finally {
        pool.end();
    }
};

seedAdmin();
