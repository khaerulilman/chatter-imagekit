import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/index.js";

dotenv.config();
const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views")); // Views folder path

// Middleware untuk parsing JSON
app.use(express.json());

// **Pastikan CORS dipanggil sebelum route**
app.use(
  cors({
    origin: "http://localhost:5173", // Sesuaikan dengan frontend kamu
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes (Sudah termasuk register)
app.use("/api/auth", authRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
