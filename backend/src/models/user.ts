export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role_id: number;
    created_at?: Date;
}
