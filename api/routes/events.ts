import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Create an Event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, topic, size, date, location } = req.body;
    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        topic,
        size,
        date: new Date(date),
        location,
        status: false,
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: `Failed to create event: ${error}` });
  }
});

// Get all Events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch events: ${error}` });
  }
});

// Get a specific Event by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch event: ${error}` });
  }
});

// Update an Event
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, topic, size, date, location } = req.body;
  try {
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { name, description, topic, size, date: new Date(date), location },
    });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: `Failed to update event: ${error}` });
  }
});

// Delete an Event
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete event: ${error}` });
  }
});

export default router;
