// Due to the drop of the Attendee model in the Prisma schema, this route is deprecated. 
//
//
// import { Router, Request, Response, RequestHandler } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const router = Router();

// // Add a list of attendees to an event
// router.post('/', async (req: Request, res: Response) => {
//     const attendees = req.body;

//     if (!Array.isArray(attendees) || attendees.length === 0) {
//         res.status(400).json({ error: 'Invalid or missing attendees data' });
//         return;
//     }

//     try {
//         const createdAttendees = await prisma.attendee.createMany({
//             data: attendees,
//         });
//         console.log(`POST /attendees - created ${createdAttendees.count} attendees`);
//         res.status(201).json({ message: 'Attendees created successfully', count: createdAttendees.count });
//     } catch (error) {
//         console.error('Error creating attendees:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Get all attendees
// router.get('/', async (req: Request, res: Response) => {
//     try {
//         const attendees = await prisma.attendee.findMany();
//         console.log(`GET /attendees - fetched ${attendees.length} attendees`);
//         res.status(200).json(attendees);
//     } catch (error) {
//         console.error('Error fetching attendees:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// // Get all attendees for an event using the Event model
// router.get('/:eventId', async (req: Request, res: Response) => {
//     const { eventId } = req.params;

//     try {
//         // Retrieve the event with its associated attendees
//         const eventWithAttendees = await prisma.event.findUnique({
//             where: { id: parseInt(eventId) },
//             include: { attendees: true }, // Include the related attendees
//         });


//         if (!eventWithAttendees) {
//             res.status(404).json({ message: 'Event not found' });
//             return;
//         }

//         if (eventWithAttendees.attendees.length === 0) {
//             res.status(404).json({ message: 'No attendees found for this event' });
//             return;
//         }
        
//         console.log('GET /attendees/:eventId - attendees:', eventWithAttendees.attendees);
//         res.status(200).json(eventWithAttendees.attendees);
//     } catch (error) {
//         console.error('Error fetching attendees:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // delete all attendee(s) for an event using the Event model
// router.delete('/:eventId', async (req: Request, res: Response): Promise<void> => {
//     const { eventId } = req.params;

//     try {
//         // Check if the event exists
//         const eventExists = await prisma.event.findUnique({
//             where: { id: parseInt(eventId, 10) },
//         });

//         if (!eventExists) {
//             res.status(404).json({ error: `Event with ID ${parseInt(eventId, 10)} not found.` });
//         }

//         // Delete attendees associated with the event
//         const deletedAttendees = await prisma.attendee.deleteMany({
//             where: { eventId: parseInt(eventId, 10) },
//         });

//         // Check if any attendees were deleted
//         if (deletedAttendees.count === 0) {
//             res.status(200).json({
//                 message: `No attendees found for event ID ${parseInt(eventId, 10)}. Nothing was deleted.`,
//                 count: 0,
//             });
//             return;
//         }

//         console.log(`DELETE /attendees/${eventId} - deleted ${deletedAttendees.count} attendees`);
//         res.status(200).json({
//             message: 'Attendees deleted successfully.',
//             count: deletedAttendees.count,
//         });
//     } catch (error) {
//         console.error('Error deleting attendees:', error);
//         res.status(500).json({
//             error: 'Internal server error.',
//             details: (error as any)?.message,
//         });
//     }
// });

// // delete one attendee for an event using the Event model
// router.delete('/:eventId/:attendeeId', async (req: Request, res: Response) => {
//     const { eventId, attendeeId } = req.params;

//     try {
//         // Delete the attendee
//         const deletedAttendee = await prisma.attendee.delete({
//             where: { id: parseInt(attendeeId) },
//         });

//         console.log(`DELETE /attendees/:eventId/:attendeeId - deleted attendee with ID ${attendeeId}`);
//         res.status(200).json({ message: 'Attendee deleted successfully', attendee: deletedAttendee });
//     } catch (error) {
//         console.error('Error deleting attendee:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// export default router;
