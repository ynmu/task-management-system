# BC Cancer Event Management System

This is the repository for the BC Cancer Event Management System.

Auth Page
<img width="1466" alt="image" src="https://github.com/user-attachments/assets/22feb75e-a25f-4bb6-8b21-eec8f3af26e7" />

Dashboard
<img width="1469" alt="image" src="https://github.com/user-attachments/assets/73aab1f6-3605-4124-b963-a5d85adeb417" />

Event creation
<img width="1468" alt="image" src="https://github.com/user-attachments/assets/d864354c-37d3-45a7-b012-12906dce5c7d" />

Manage events and view notes
<img width="1468" alt="image" src="https://github.com/user-attachments/assets/fafc1cfd-9c39-4069-9409-2c944722f12f" />

Check team structure
<img width="1470" alt="image" src="https://github.com/user-attachments/assets/9b6fbf38-c6bd-47b1-bdbb-00fea602684e" />

Account management
<img width="1470" alt="image" src="https://github.com/user-attachments/assets/2adad95a-1865-428c-b534-ec07f7006500" />


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
