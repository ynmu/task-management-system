# API Server Setup

Note: Project script is already set up under CS5500_GROUP4_BCCANCER, so if you are new to this project, you can skip the setup steps below and directly run the project using the command `npm run dev` in the root directory.

## Before You Get Started - Environment Variables

Copy the `.env.example` file to `.env` in the `api` folder and update the `DATABASE_URL` with your PostgreSQL database connection string.

If you haven't set up a PostgreSQL database yet, you can use the following command to create a new database (update myuser, mypassword, and mydb with your desired username, password, and database name):

```bash
# Log in to psql as postgres superuser
psql -U postgres
```

```sql
-- Create a new user with a password
CREATE USER myuser WITH PASSWORD 'mypassword';

-- Create a new database
CREATE DATABASE mydb;

-- Grant privileges to the new user on the new database
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;

-- Allow the user to create tables for prisma
ALTER USER myuser CREATEDB;
-- Exit psql
\q
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


