import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const JWT = "nearbux0@123";


const authMiddleware = (req, res, next) => {
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
            return res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        
        return res.status(500).json({ message: "Authentication error" });
    }
};

const app = express();
app.use(express.json());
app.use(cors()); // 

console.log("working");

// // Check if DATABASE_URL is set
// if (!process.env.DATABASE_URL) {
  
//     process.exit(1);
// }

const prisma = new PrismaClient();

app.get("/live", (req, res) => {
    res.status(200).json({ message: "jinda hu " });
});

app.post("/signin", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (username !== "realharsh" || password !== "nearbux@0123") {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign({ username: username }, JWT);
    return res.status(200).json({ message: "Successfully signed in", token: token });
});

app.post("/delete", authMiddleware, async (req, res) => {
    try {
        const { usernames } = req.body;
        
        console.log("Delete request received:", { usernames });
        
        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ message: "Invalid or empty usernames array" });
        }

        const result = await prisma.shopKeeper.deleteMany({
            where: { id: { in: usernames } }
        });

        console.log("Delete result:", result);
        
        const deletedCount = result.count || 0;
        
        return res.status(200).json({ 
            message: `Successfully deleted ${deletedCount} shopkeepers`,
            deletedCount: deletedCount 
        });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
});

app.post("/accept", authMiddleware, async (req, res) => {
    try {
        const { usernames } = req.body;
        
        console.log("Accept request received:", { usernames });
        
        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ message: "Invalid or empty usernames array" });
        }

        const result = await prisma.shopKeeper.updateMany({
            where: {
                id: { in: usernames }
            },
            data: { verified: true }
        });

        console.log("Accept result:", result);
        
        const verifiedCount = result.count || 0;

        return res.status(200).json({ 
            message: `Successfully verified ${verifiedCount} shopkeepers`,
            verifiedCount: verifiedCount 
        });
    } catch (error) {
        console.error("Accept error:", error);
        return res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
});

app.get("/unverified", async (req, res) => {
    try {
        const users = await prisma.shopKeeper.findMany({
            where: {
                verified: false
            },
            include: {
                shops: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        tagline: true,
                        localArea: true,
                    }
                }
            }
        });

        return res.status(200).json({ 
            message: "Unverified shopkeepers fetched successfully",
            data: users 
        });
    } catch (error) {
        console.error("Unverified fetch error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});