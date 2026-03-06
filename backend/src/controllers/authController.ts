import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { findUserById } from '../repositories/userRepository';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const userRole = role === 'Admin' ? 'Admin' : 'Staff';
        const user = await registerUser(name, email, password, userRole);
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, identifier, password } = req.body;
        const loginIdentifier = identifier || email;
        const data = await loginUser(loginIdentifier, password);
        res.json({
            message: 'Logged in successfully',
            token: data.token,
            user: { id: data.user.id, name: data.user.name, email: data.user.email, role_id: data.user.role_id }
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id } });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
