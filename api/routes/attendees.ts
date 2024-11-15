import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Add a list of attendees to an event
router.post('/', async (req: Request, res: Response) => {
    const attendees = req.body;

    if (!Array.isArray(attendees) || attendees.length === 0) {
        res.status(400).json({ error: 'Invalid or missing attendees data' });
        return;
    }

    try {
        const createdAttendees = await prisma.attendee.createMany({
            data: attendees,
        });
        console.log('POST /attendees - createdAttendees:', createdAttendees);
        res.status(201).json({ message: 'Attendees created successfully', count: createdAttendees.count });
    } catch (error) {
        console.error('Error creating attendees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get all attendees
router.get('/', async (req: Request, res: Response) => {
    try {
        const attendees = await prisma.attendee.findMany();
        console.log('GET /attendees - attendees:', attendees);
        res.status(200).json(attendees);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get all attendees for an event using the Event model
router.get('/:eventId', async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
        // Retrieve the event with its associated attendees
        const eventWithAttendees = await prisma.event.findUnique({
            where: { id: parseInt(eventId) },
            include: { attendees: true }, // Include the related attendees
        });

        console.log('GET /attendees/:eventId - eventWithAttendees:', eventWithAttendees);

        if (!eventWithAttendees) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }

        if (eventWithAttendees.attendees.length === 0) {
            res.status(404).json({ message: 'No attendees found for this event' });
            return;
        }
        
        res.status(200).json(eventWithAttendees.attendees);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
