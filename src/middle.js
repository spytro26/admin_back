import jwt from 'jsonwebtoken';

const JWT = "nearbux0@123";

export const middle = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, JWT);
            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError);
            return res.status(401).json({ message: "not right credentials" });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ message: "Authentication error" });
    }
};