import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Create an Event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, topic, size, date, location, roleId } = req.body;
    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        topic,
        size,
        date: new Date(date),
        location,
        roleId,
        status: false
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

// Get all events of a specific role
router.get('/role/:roleId', async (req: Request, res: Response) => {
  const { roleId } = req.params;

  try {
    // Find the role and include the associated events
    const roleWithEvents = await prisma.role.findUnique({
      where: {
        id: parseInt(roleId),
      },
      include: {
        sharedEvents: true, // This assumes your model relation is correctly set
      },
    });

    if (!roleWithEvents) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    res.status(200).json(roleWithEvents.sharedEvents);
  } catch (error) {
    console.error('Error fetching events for role:', error);
    res.status(500).json({ error: 'Failed to fetch events for the role' });
  }
});


// Update an Event
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, topic, size, date, location, status } = req.body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (topic !== undefined) data.topic = topic;
  if (size !== undefined) data.size = size;
  if (date !== undefined) data.date = new Date(date);
  if (location !== undefined) data.location = location;
  if (status !== undefined) data.status = status;

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data, // Use the constructed data object
    });
    console.log(`PUT /api/events/${id} updated: ${JSON.stringify(updatedEvent)}`);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log(`PUT /api/events/${id} failed: ${error}`);
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
