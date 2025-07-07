# CRYPTOTRACK

CRYPTOTRACK is a full-stack application designed to help users manage their cryptocurrency portfolios. It provides features for tracking transactions, setting up alerts, and visualizing portfolio performance.

## Features

*   User Authentication (Login, Registration)
*   Transaction Management (Add, View, Edit, Delete transactions)
*   Portfolio Dashboard (Overview of holdings and performance)
*   Price Alerts (Set up alerts for cryptocurrency price changes)
*   CSV Import for transactions

## Technologies Used

### Client (Frontend)

*   React
*   TypeScript
*   Tailwind CSS

### Server (Backend)

*   Node.js
*   Express.js
*   TypeScript
*   Prisma (ORM)
*   PostgreSQL (Database)

## Setup and Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mikeydever/CRYPTOTRACK.git
    cd CRYPTOTRACK
    ```

2.  **Install dependencies for the client:**
    ```bash
    cd client
    npm install
    ```

3.  **Install dependencies for the server:**
    ```bash
    cd ../server
    npm install
    ```

4.  **Database Setup (Server):**
    *   Ensure you have PostgreSQL installed and running.
    *   Create a `.env` file in the `server/` directory based on `server/.env.example` (if available, otherwise create one with your database connection string).
    *   Run Prisma migrations to set up your database schema:
        ```bash
        npx prisma migrate dev --name initial_setup
        ```

## Running the Application

### Start the Server

From the `server/` directory:

```bash
npm run dev
```

### Start the Client

From the `client/` directory:

```bash
npm start
```

The client application should open in your browser, usually at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

[Specify your license here, e.g., MIT License]