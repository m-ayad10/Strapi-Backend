import jwt from "jsonwebtoken";
import { CONFIG } from "../config/config";

const users = [
    {
        id: "1",
        email: "airtic@gmail.com",
        password: "password123",
        name: "Airtic",
    },
    {
        id: "2",
        email: "ixigo@gmail.com",
        password: "password123",
        name: "Ixigo",
    },
];

export const loginUser = async (email: string, password: string): Promise<{ token: string; user: any } | null> => {
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        return null;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        CONFIG.JWT_SECRET,
        { expiresIn: CONFIG.JWT_EXPIRES_IN as any }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};
