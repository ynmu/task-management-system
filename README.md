# BC Cancer Event Management System

This is the repository for the BC Cancer Event Management System.

<img width="1336" alt="image" src="https://github.com/user-attachments/assets/16b4e9a8-7244-45c6-bc85-1f695ddc1178" />


## Project Setup and Running
1. Clone the repository:

```bash
git clone https://github.com/5500Group4/5500Group4.git
```

2. Navigate to the project directory:

```bash
cd CS5500_GROUP4_BCCANCER
```
3. Set up the environment variables:
- Copy the `.env.example` file to `.env` in the `api` folder and update the `DATABASE_URL` with your PostgreSQL database connection string.
- If you haven't set up a PostgreSQL database yet, refer to the [API README](api/README.md) for details.


4. The project uses `concurrently` for managing multiple processes. To install or update dependencies for both the frontend and backend, simply run:

```bash
npm run install
```
in the root directory (`CS5500_GROUP4_BCCANCER`, where this README is located).

To start the project, run in the root directory:

```bash
npm run dev
```

## Separate Development

Please refer to the [API README](api/README.md) for available API endpoints and instructions on setting up the API.

Please refer to the [Client README](client/README.md) for instructions on starting the client.

## Final Report
[Presentation Slides](https://docs.google.com/presentation/d/1JlcwcwVtBgHGEy29qXcxJ7ct2JRUZ2kfdQDLSVUCTUg/edit#slide=id.g317e436215d_0_14)
