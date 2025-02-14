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

// Daftar origin yang diizinkan
const allowedOrigins = [
  "http://localhost:5173", // Untuk development lokal
  "https://chatter-new.vercel.app", // Untuk production di Vercel
];

// Konfigurasi CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Log origin untuk debugging
      console.log("Request Origin:", origin);

      // Izinkan request tanpa origin (seperti mobile apps atau curl requests)
      if (!origin) return callback(null, true);

      // Cek apakah origin ada di daftar allowedOrigins
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }

      // Izinkan request
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode HTTP yang diizinkan
    allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan
  })
);

// API Routes (Sudah termasuk register)
app.use("/api/auth", authRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
