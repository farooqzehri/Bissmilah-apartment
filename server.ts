import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION CACHING FOR SERVERLESS ---
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      return;
    }
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables!");
    }
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}

// Auto-connect DB for any API routes
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({ success: false, error: "Database connection failed" });
    }
  }
  next();
});

// ==========================================
// APIS & ROUTES (Yahan apne baaki routes add karein)
// ==========================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: "Backend is running smoothly on Vercel!" });
});

// Example: Agar aapke paas aur routes hain toh unhe yahan mount karein:
// import authRoutes from './routes/auth';
// import propertyRoutes from './routes/properties';
// app.use('/api/auth', authRoutes);
// app.use('/api/properties', propertyRoutes);

// ==========================================

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

// Local Development ke liye listener (Vercel isko ignore karega)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// VERCEL REQUIREMENT: Export the Express app as default
export default app;