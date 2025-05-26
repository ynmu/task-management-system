import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// IMPORTANT: Put /recent route BEFORE /:eventId to avoid conflicts
// GET /notes/recent - Get recent notes with priority and filtering
router.get('/recent', async (req: Request, res: Response) => {
  const userIdHeader = req.header('x-user-id');
  const limitParam = req.query.limit as string;
  const priority = req.query.priority as string || 'all'; // 'urgent', 'normal', 'all'

  // Validate parameters
  const userId = userIdHeader ? parseInt(userIdHeader, 10) : null;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  if (!userId || isNaN(userId)) {
    res.status(400).json({ error: 'Missing or invalid x-user-id header.' });
    return;
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 50.' });
    return;
  }

  try {
    // Get user's role and shared events
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            sharedEvents: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!user?.role) {
      res.status(404).json({ error: 'User role not found.' });
      return;
    }

    const eventIds = user.role.sharedEvents.map(se => se.eventId);

    if (eventIds.length === 0) {
      res.json({
        notes: [],
        summary: {
          totalNotes: 0,
          urgentNotes: 0,
          eventsWithNotes: 0,
          lastActivity: null,
        },
      });
      return;
    }

    // Build where clause based on priority filter
    const whereClause: any = {
      eventId: { in: eventIds },
    };

    // Add priority filtering if specified
    if (priority === 'urgent') {
      whereClause.OR = [
        { message: { contains: 'urgent', mode: 'insensitive' } },
        { message: { contains: 'priority', mode: 'insensitive' } },
        { message: { contains: 'asap', mode: 'insensitive' } },
        { message: { contains: 'important', mode: 'insensitive' } },
        { message: { contains: '!!', mode: 'insensitive' } },
      ];
    }

    // Get recent notes with detailed information
    const recentNotes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            status: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            profileUrl: true,
          },
        },
      },
    });

    // Get summary statistics
    const [totalNotesCount, urgentNotesCount, eventsWithNotesCount] = await Promise.all([
      prisma.note.count({
        where: { eventId: { in: eventIds } },
      }),
      prisma.note.count({
        where: {
          eventId: { in: eventIds },
          OR: [
            { message: { contains: 'urgent', mode: 'insensitive' } },
            { message: { contains: 'priority', mode: 'insensitive' } },
            { message: { contains: 'asap', mode: 'insensitive' } },
            { message: { contains: 'important', mode: 'insensitive' } },
            { message: { contains: '!!', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.note.groupBy({
        by: ['eventId'],
        where: { eventId: { in: eventIds } },
        _count: true,
      }).then(groups => groups.length),
    ]);

    // Get last activity timestamp
    const lastActivity = await prisma.note.findFirst({
      where: { eventId: { in: eventIds } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Enhance notes with priority detection and time formatting
    const enhancedNotes = recentNotes.map(note => {
      const isUrgent = /urgent|priority|asap|important|!!/i.test(note.message);
      const timeAgo = getTimeAgo(note.createdAt);
      
      return {
        ...note,
        isUrgent,
        timeAgo,
        preview: note.message.length > 100 ? note.message.substring(0, 100) + '...' : note.message,
      };
    });

    res.json({
      notes: enhancedNotes,
      summary: {
        totalNotes: totalNotesCount,
        urgentNotes: urgentNotesCount,
        eventsWithNotes: eventsWithNotesCount,
        lastActivity: lastActivity?.createdAt || null,
        userRole: user.role.roleName,
        activeEvents: user.role.sharedEvents.filter(se => se.event.status === true).length,
      },
      filters: {
        applied: priority,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching recent notes:', error);
    res.status(500).json({ error: 'Failed to retrieve recent notes.' });
  }
});

// GET /notes/:eventId - Get all notes for a specific event
router.get('/:eventId', async (req: Request, res: Response) => {
  const { eventId } = req.params;
  
  console.log('Received eventId parameter:', eventId); // Debug log
  
  // Validate eventId parameter
  const eventIdNum = parseInt(eventId, 10);
  if (isNaN(eventIdNum)) {
    console.log('Invalid eventId - not a number:', eventId); // Debug log
    res.status(400).json({ error: 'Invalid event ID provided.' });
    return;
  }

  console.log('Parsed eventId:', eventIdNum); // Debug log

  try {
    const notes = await prisma.note.findMany({
      where: { eventId: eventIdNum },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            profileUrl: true,
          },
        },
      },
    });

    console.log('Found notes:', notes.length); // Debug log
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

// POST /notes/:eventId - Create a new note for a specific event
router.post('/:eventId', async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const senderIdHeader = req.header('x-user-id');
  const { message } = req.body;

  // Validate parameters
  const eventIdNum = parseInt(eventId, 10);
  const senderId = senderIdHeader ? parseInt(senderIdHeader, 10) : null;

  if (isNaN(eventIdNum)) {
    res.status(400).json({ error: 'Invalid event ID provided.' });
    return;
  }

  if (!senderId || isNaN(senderId) || !message) {
    res.status(400).json({ error: 'Missing sender ID or message.' });
    return;
  }

  try {
    const note = await prisma.note.create({
      data: {
        message,
        eventId: eventIdNum,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            profileUrl: true,
            firstName: true,
            lastName: true,
            userName: true,
          },
        },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note.' });
  }
});

// GET /notes/recent - Get recent notes with priority and filtering
router.get('/recent', async (req: Request, res: Response) => {
  const userIdHeader = req.header('x-user-id');
  const limitParam = req.query.limit as string;
  const priority = req.query.priority as string || 'all'; // 'urgent', 'normal', 'all'

  // Validate parameters
  const userId = userIdHeader ? parseInt(userIdHeader, 10) : null;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  if (!userId || isNaN(userId)) {
    res.status(400).json({ error: 'Missing or invalid x-user-id header.' });
    return;
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 50.' });
    return;
  }

  try {
    // Get user's role and shared events
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            sharedEvents: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!user?.role) {
      res.status(404).json({ error: 'User role not found.' });
      return;
    }

    const eventIds = user.role.sharedEvents.map(se => se.eventId);

    if (eventIds.length === 0) {
      res.json({
        notes: [],
        summary: {
          totalNotes: 0,
          urgentNotes: 0,
          eventsWithNotes: 0,
          lastActivity: null,
        },
      });
      return;
    }

    // Build where clause based on priority filter
    const whereClause: any = {
      eventId: { in: eventIds },
    };

    // Add priority filtering if specified
    if (priority === 'urgent') {
      whereClause.OR = [
        { message: { contains: 'urgent', mode: 'insensitive' } },
        { message: { contains: 'priority', mode: 'insensitive' } },
        { message: { contains: 'asap', mode: 'insensitive' } },
        { message: { contains: 'important', mode: 'insensitive' } },
        { message: { contains: '!!', mode: 'insensitive' } },
      ];
    }

    // Get recent notes with detailed information
    const recentNotes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            status: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            profileUrl: true,
          },
        },
      },
    });

    // Get summary statistics
    const [totalNotesCount, urgentNotesCount, eventsWithNotesCount] = await Promise.all([
      prisma.note.count({
        where: { eventId: { in: eventIds } },
      }),
      prisma.note.count({
        where: {
          eventId: { in: eventIds },
          OR: [
            { message: { contains: 'urgent', mode: 'insensitive' } },
            { message: { contains: 'priority', mode: 'insensitive' } },
            { message: { contains: 'asap', mode: 'insensitive' } },
            { message: { contains: 'important', mode: 'insensitive' } },
            { message: { contains: '!!', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.note.groupBy({
        by: ['eventId'],
        where: { eventId: { in: eventIds } },
        _count: true,
      }).then(groups => groups.length),
    ]);

    // Get last activity timestamp
    const lastActivity = await prisma.note.findFirst({
      where: { eventId: { in: eventIds } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Enhance notes with priority detection and time formatting
    const enhancedNotes = recentNotes.map(note => {
      const isUrgent = /urgent|priority|asap|important|!!/i.test(note.message);
      const timeAgo = getTimeAgo(note.createdAt);
      
      return {
        ...note,
        isUrgent,
        timeAgo,
        preview: note.message.length > 100 ? note.message.substring(0, 100) + '...' : note.message,
      };
    });

    res.json({
      notes: enhancedNotes,
      summary: {
        totalNotes: totalNotesCount,
        urgentNotes: urgentNotesCount,
        eventsWithNotes: eventsWithNotesCount,
        lastActivity: lastActivity?.createdAt || null,
        userRole: user.role.roleName,
        activeEvents: user.role.sharedEvents.filter(se => se.event.status === true).length,
      },
      filters: {
        applied: priority,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching recent notes:', error);
    res.status(500).json({ error: 'Failed to retrieve recent notes.' });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default router;