import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserByIdentifier, createUser } from '../repositories/userRepository';

export const registerUser = async (name: string, email: string, password: string, roleName: 'Admin' | 'Staff') => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new Error('User already exists');

    const roleId = roleName === 'Admin' ? 1 : 2; // 1 for Admin, 2 for Staff based on schema
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await createUser(name, email, passwordHash, roleId);
    return newUser;
};

export const loginUser = async (identifier: string, password: string) => {
    const user = await findUserByIdentifier(identifier);
    if (!user) throw new Error('Invalid credentials');

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) throw new Error('Invalid credentials');

    const token = jwt.sign(
        { id: user.id, email: user.email, role_id: user.role_id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    return { user, token };
};
