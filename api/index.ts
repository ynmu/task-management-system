import express from 'express';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import attendeeRoutes from './routes/attendees';
import cors from 'cors';
import seedRoles from './services/seedRoles';


const app = express();
const PORT = process.env.PORT || 6521;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
}));


// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/attendees', attendeeRoutes);


(async () => {
  await seedRoles(); // Seed roles on app startup
})();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
