import express from 'express';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';

const app = express();
const PORT = process.env.PORT || 5921;

// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
