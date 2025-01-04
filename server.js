import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/index.js';



dotenv.config();
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));  // Views folder path

// Middleware for parsing JSON
app.use(express.json());
app.use('/api/auth', authRoutes);  // API Routes

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Route to render register page
app.get("/register", (req, res) => {
  res.render('register', { errorMessage: '' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
