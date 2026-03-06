import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

import { initJobs } from './jobs/billingJob';
import customerRoutes from './routes/customerRoutes';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Init CRON jobs
initJobs();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
    res.send('Car Park API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
