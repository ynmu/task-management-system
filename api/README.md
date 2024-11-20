# API Server Setup

## Before You Get Started - Environment Variables

Create a `.env` file in the `` directory with the following content (update the `DATABASE_URL` as per rubing's credentials; please refer to the group chat):

```env
DATABASE_URL="postgresql://cs5500_group4_bccancer_user:xxxx@xxxx.oregon-postgres.render.com/cs5500_group4_bccancer"
```

Go to api folder and run the following commands:
# Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

# Migrate and Generate Database


To generate the Prisma client, use:

```bash
npx prisma generate
```

To start the interactive database studio, use:

```bash
npx prisma studio
```


To reset the database and deploy the current schema, use (**Note**: this will potentially delete all data in the database. Use with caution.):

```bash
npx prisma migrate deploy
```


# Run the Server

Start the server using the following command:
    
```bash
ts-node index.ts
```


# Available Endpoints

The API server is hosted at `http://localhost:6521`, as configured in `api/index.ts`.

The Front-end is hosted at `http://localhost:3256`. Make sure you update the cors in `api/index.ts` if you want to change the port number; otherwise, safely ignore this paragraph.

The endpoints below are available, see `routes/` for details.

**Note**: role creation via `/users/roles` is automatically done via `services/seedRoles.ts` every time the server is started. This is typically not required manually.

## Attendees (`/attendees`)
1. **POST `/attendees/`** - Adds a list of attendees to an event.
   - Request Body: Array of attendee objects.
   - Response: Success message with the count of attendees created.
2. **GET `/attendees/`** - Retrieves all attendees.
   - Response: List of all attendees.
3. **GET `/attendees/:eventId`** - Retrieves all attendees for a specific event.
   - Path Parameter: `eventId` - ID of the event.

## Events (`/events`)
1. **POST `/events/`** - Creates a new event.
   - Request Body: Event details (name, description, topic, etc.).
   - Response: The created event object.
2. **GET `/events/`** - Retrieves all events.
   - Response: List of all events.
3. **GET `/events/:id`** - Retrieves a specific event by ID.
   - Path Parameter: `id` - ID of the event.
4. **GET `/events/role/:roleId`** - Retrieves all events associated with a specific role.
   - Path Parameter: `roleId` - ID of the role.
5. **PUT `/events/:id`** - Updates an event by ID.
   - Path Parameter: `id` - ID of the event.
   - Request Body: Fields to be updated.
6. **DELETE `/events/:id`** - Deletes an event by ID.
   - Path Parameter: `id` - ID of the event.

## Users (`/users`)
1. **POST `/users/roles`** - Creates a new role.
   - Request Body: Role details (roleName).
2. **GET `/users/roles`** - Retrieves all roles.
   - Response: List of all roles.
3. **GET `/users/roles/:roleId`** - Retrieves all users associated with a specific role.
   - Path Parameter: `roleId` - ID of the role.
4. **POST `/users/signup`** - Creates a new user.
   - Request Body: User details (userName, employeeNumber, roleId, password).
   - Response: Created user object with role information.
5. **POST `/users/login`** - Logs in a user.
   - Request Body: User credentials (userName, password).
   - Response: User details with role information.
6. **GET `/users/all`** - Retrieves all users.
   - Response: List of all users with role information.


