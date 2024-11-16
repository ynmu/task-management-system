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
    console.log(`POST /events created: ${JSON.stringify(newEvent)}`);
    res.status(201).json(newEvent);
  } catch (error) {
    console.log(`POST /events failed: ${error}`);
    res.status(500).json({ error: `Failed to create event: ${error}` });
  }
});

// Get all Events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();
    console.log(`GET /events fetched: ${events.length} events`);
    res.status(200).json(events);
  } catch (error) {
    console.log(`GET /events failed: ${error}`);
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
      console.log(`GET /events/${id} fetched: ${JSON.stringify(event)}`);
      res.status(200).json(event);
    } else {
      console.log(`GET /events/${id} failed: Event not found`);
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.log(`GET /events/${id} failed: ${error}`);
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
      console.log(`GET /events/role/${roleId} failed: Role not found`);
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    console.log(`GET /events/role/${roleId} fetched: ${roleWithEvents.sharedEvents.length} events`);
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
    console.log(`PUT /events/${id} updated: ${JSON.stringify(updatedEvent)}`);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log(`PUT /events/${id} failed: ${error}`);
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
    console.log(`DELETE /events/${id} deleted`);
    res.status(204).json({ message: 'Event deleted' });
  } catch (error) {
    console.log(`DELETE /events/${id} failed: ${error}`);
    res.status(500).json({ error: `Failed to delete event: ${error}` });
  }
});

export default router;
