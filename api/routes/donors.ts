import { Router, Request, Response } from 'express';
import { Donor, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

function serializeDonor(donor: Donor) {
  return {
    ...donor,
    firstGiftDate: donor.firstGiftDate.toString(),
    lastGiftDate: donor.lastGiftDate.toString(),
    lastGiftRequest: donor.lastGiftRequest.toString()
  };
}

// 📌 Get all donors (optionally by city)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.query;

    const donors = await prisma.donor.findMany({
      where: city ? { city: String(city).trim() } : undefined,
    });

    const serialized = donors.map(serializeDonor);
    console.log(`GET /donors - fetched ${serialized.length} donors`);
    res.status(200).json(serialized);
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 📌 Get donor by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const donor = await prisma.donor.findUnique({ where: { id } });

    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }
    res.status(200).json(serializeDonor(donor));
  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all donors for an event
router.get('/event/:eventId', async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.eventId);
  try {
    const donors = await prisma.donorOnEvent.findMany({
      where: { eventId },
      include: {
        donor: true,
      },
    });
    const serialized = donors.map((donorOnEvent) => ({
      ...donorOnEvent.donor,
      eventId: donorOnEvent.eventId,
      id: donorOnEvent.donorId,
    }));
    console.log(`GET /donors/event/${eventId} - fetched ${serialized.length} donors`);
    res.status(200).json(serialized);
  } catch (error) {
    console.error('Error fetching donors for event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add a list of donors
router.post('/', async (req: Request, res: Response) => {
    const donors = req.body;
    if (!Array.isArray(donors) || donors.length === 0) {
        res.status(400).json({ error: 'Invalid or missing donor data' });
    }
    try {
        const result = await prisma.donor.createMany({ data: donors });
        console.log(`POST /donors - created ${result.count} donors`);
        res.status(201).json({ message: 'Donors created successfully', count: result.count });
    } catch (error) {
        console.error('Error creating donors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save donors to an event
router.post('/savetoevent', async (req: Request, res: Response) => {
  const { eventId, donorIds } = req.body;
  if (!eventId || !Array.isArray(donorIds) || donorIds.length === 0) {
    res.status(400).json({ error: 'Invalid eventId or donorIds' });
  }
  try {
    const data = donorIds.map((donorId: number) => ({
      donorId,
      eventId,
    }));

    const result = await prisma.donorOnEvent.createMany({data, skipDuplicates: true,});

    res.status(201).json({ message: 'Donors linked to event', count: result.count });
  } catch (error) {
    console.error('Error saving donors to event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get donor by ID
router.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const donor = await prisma.donor.findUnique({ where: { id } });
        if (!donor) {
            res.status(404).json({ error: 'Donor not found' });
        }
        res.status(200).json(donor);
    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Delete donor by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const deleted = await prisma.donor.delete({ where: { id } });
        console.log(`DELETE /donors/${id} - deleted donor`);
        res.status(200).json({ message: 'Donor deleted', donor: deleted });
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
