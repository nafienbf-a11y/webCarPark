import pool from './db';

const applyMigrations = async () => {
    try {
        console.log('Applying new schema columns for Operations...');

        // 1. Customers Extension
        await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS long_term_number VARCHAR(50)`);
        await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS corporate_account BOOLEAN DEFAULT FALSE`);

        // 2. Vehicles Extension
        await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make VARCHAR(100)`);
        await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model VARCHAR(100)`);
        await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS key_number VARCHAR(50)`);
        await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location_status VARCHAR(50) DEFAULT 'Ready'`);
        await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS do_not_move BOOLEAN DEFAULT FALSE`);

        // 3. Parking Sessions Extension
        await pool.query(`ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS return_flight VARCHAR(100)`);
        await pool.query(`ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS expected_return TIMESTAMP`);
        await pool.query(`ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS discount_applied BOOLEAN DEFAULT FALSE`);
        await pool.query(`ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS staff_handled_id INTEGER`);

        // 4. Payments Extension
        await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'Eftpos'`);
        await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS staff_handled_id INTEGER`);

        // 5. New Table: Daily Reconciliation
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_reconciliation (
                id SERIAL PRIMARY KEY,
                reconciliation_date DATE NOT NULL,
                total_eftpos DECIMAL(10, 2) DEFAULT 0.00,
                total_cash DECIMAL(10, 2) DEFAULT 0.00,
                petty_cash_expenses DECIMAL(10, 2) DEFAULT 0.00,
                closed_by_staff_id INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'Closed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. New Table: Petty Cash Logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS petty_cash_logs (
                id SERIAL PRIMARY KEY,
                amount DECIMAL(10, 2) NOT NULL,
                reason VARCHAR(255) NOT NULL,
                logged_by_staff_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Migrations applied successfully!');
    } catch (err) {
        console.error('Error applying migrations:', err);
    } finally {
        pool.end();
    }
};

applyMigrations();
