import cron from 'node-cron';
import pool from '../config/db';
import nodemailer from 'nodemailer';

export const initJobs = () => {
    // Run on the 20th of every month at 00:00
    cron.schedule('0 0 20 * *', async () => {
        console.log('Running monthly billing job...');
        try {
            // Find customers with negative balance (or positive balance representing amount owed)
            // Assuming balance > 0 means they owe money
            const result = await pool.query("SELECT * FROM customers WHERE balance > 0 AND status = 'Active'");
            const customers = result.rows;

            if (customers.length === 0) {
                console.log('No customers to bill this month.');
                return;
            }

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '2525'),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            for (const customer of customers) {
                const mailOptions = {
                    from: process.env.SMTP_FROM,
                    to: customer.email,
                    subject: 'Your Monthly CarPark Balance',
                    text: `Hello ${customer.name},\n\nYour current balance is $${customer.balance}. \n\nPlease pay using this link: https://carpark.com/pay/${customer.id}\n\nThank you!`
                };

                try {
                    await transporter.sendMail(mailOptions);
                    await pool.query(
                        "INSERT INTO email_logs (customer_id, status, type) VALUES ($1, $2, $3)",
                        [customer.id, 'Sent', 'Monthly Balance']
                    );
                    console.log(`Email sent to ${customer.email}`);
                } catch (err: any) {
                    console.error(`Failed to send email to ${customer.email}:`, err.message);
                    await pool.query(
                        "INSERT INTO email_logs (customer_id, status, type) VALUES ($1, $2, $3)",
                        [customer.id, 'Failed', 'Monthly Balance']
                    );
                }
            }
        } catch (error) {
            console.error('Error in monthly billing job:', error);
        }
    });
    console.log('Cron jobs initialized');
};
