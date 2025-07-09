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

# CryptoTrack Pro - Complete Project Context

## Quick Start
I'm building a cryptocurrency portfolio tracker. When I ask you to implement features, follow these patterns and conventions. **Always create tests alongside features and verify functionality before moving on.**

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS + Recharts
- Backend: Node.js + Express + TypeScript + PostgreSQL + Prisma
- Testing: Jest + React Testing Library + Supertest
- API: CoinGecko for prices

## Development Workflow
1. Write the feature code
2. Write tests for the feature
3. Run tests to verify
4. Create sample data to manually test
5. Document any setup needed

## Core Features Needed
1. **Portfolio Dashboard** - Show total value, profit/loss, holdings list, charts
2. **Transaction Management** - Add/edit/delete buy/sell transactions
3. **Average Price Calculation** - Track average buy price per coin
4. **Profit/Loss Tracking** - Real-time P&L calculations
5. **Price Alerts** - Notify when prices hit targets
6. **CSV Import/Export** - Bulk transaction management

## Project Structure
cryptotrack/
├── client/src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page components
│ ├── hooks/ # Custom React hooks
│ ├── services/ # API calls
│ ├── types/ # TypeScript types
│ └── tests/ # Frontend tests
├── server/src/
│ ├── routes/ # API endpoints
│ ├── services/ # Business logic
│ ├── prisma/ # Database schema
│ └── tests/ # Backend tests
├── package.json # Root package.json with test scripts
└── jest.config.js # Jest configuration


## Test Setup Commands
```json
// Root package.json
{
  "scripts": {
    "test": "npm run test:server && npm run test:client",
    "test:server": "cd server && npm test",
    "test:client": "cd client && npm test",
    "test:watch": "npm run test:server -- --watch",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm start"
  }
}
Database Schema (Prisma)
prisma
Copy Code
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  password      String
  transactions  Transaction[]
  alerts        Alert[]
  createdAt     DateTime      @default(now())
}

model Transaction {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  coinId       String   // CoinGecko ID
  coinSymbol   String   // BTC, ETH, etc
  type         String   // buy, sell
  quantity     Float
  pricePerCoin Float
  fee          Float    @default(0)
  timestamp    DateTime
  exchange     String?
  notes        String?
  createdAt    DateTime @default(now())
}
Code Patterns WITH TESTS
typescript
Copy Code
// routes/portfolio.ts
export async function getPortfolio(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });
    
    const portfolio = calculatePortfolioMetrics(transactions);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// __tests__/portfolio.test.ts
describe('Portfolio API', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
  });

  test('GET /api/portfolio returns user portfolio', async () => {
    // Setup test data
    const user = await createTestUser();
    await createTestTransaction(user.id, {
      coinId: 'bitcoin',
      type: 'buy',
      quantity: 0.5,
      pricePerCoin: 40000
    });

    // Make request
    const response = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${generateToken(user)}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.holdings).toHaveLength(1);
    expect(response.body.data.holdings[0].averagePrice).toBe(40000);
  });
});
React Component Pattern + Test
typescript
Copy Code
// components/PortfolioDashboard.tsx
export function PortfolioDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    refetchInterval: 30000
  });

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div data-testid="portfolio-dashboard">
      <h1>Portfolio Value: ${data.totalValue.toFixed(2)}</h1>
      <div data-testid="profit-loss" className={data.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
        {data.profitLoss >= 0 ? '+' : ''}{data.profitLoss.toFixed(2)} ({data.profitLossPercent.toFixed(2)}%)
      </div>
    </div>
  );
}

// __tests__/PortfolioDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

describe('PortfolioDashboard', () => {
  test('displays portfolio value and profit/loss', async () => {
    const mockData = {
      totalValue: 50000,
      profitLoss: 5000,
      profitLossPercent: 11.11
    };

    // Mock API call
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockData })
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <PortfolioDashboard />
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Portfolio Value:\$50000.00')).toBeInTheDocument();
    });

    // Check profit/loss display
    const profitLoss = screen.getByTestId('profit-loss');
    expect(profitLoss).toHaveTextContent('+5000.00 (11.11%)');
    expect(profitLoss).toHaveClass('text-green-500');
  });
});
Business Logic Pattern + Test
typescript
Copy Code
// services/portfolio.service.ts
export function calculateAveragePrice(transactions: Transaction[]): number {
  const buys = transactions.filter(t => t.type === 'buy');
  const totalQuantity = buys.reduce((sum, t) => sum + t.quantity, 0);
  const totalCost = buys.reduce((sum, t) => sum + (t.quantity * t.pricePerCoin + t.fee), 0);
  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

// __tests__/portfolio.service.test.ts
describe('Portfolio Service', () => {
  describe('calculateAveragePrice', () => {
    test('calculates correct average price with fees', () => {
      const transactions = [
        { type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 20 },
        { type: 'buy', quantity: 0.5, pricePerCoin: 50000, fee: 10 },
        { type: 'sell', quantity: 0.5, pricePerCoin: 45000, fee: 10 } // Should be ignored
      ];

      const avgPrice = calculateAveragePrice(transactions);
      // (1*40000 + 20 + 0.5*50000 + 10) / 1.5 = 43,353.33
      expect(avgPrice).toBeCloseTo(43353.33, 2);
    });

    test('returns 0 for no buy transactions', () => {
      const transactions = [
        { type: 'sell', quantity: 1, pricePerCoin: 40000, fee: 20 }
      ];
      expect(calculateAveragePrice(transactions)).toBe(0);
    });
  });
});
Test Data Helpers
typescript
Copy Code
// test-utils/factories.ts
export async function createTestUser(email = 'test@example.com') {
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash('password123', 10)
    }
  });
}

export async function createTestTransaction(userId: string, data: Partial<Transaction>) {
  return prisma.transaction.create({
    data: {
      userId,
      coinId: 'bitcoin',
      coinSymbol: 'BTC',
      type: 'buy',
      quantity: 1,
      pricePerCoin: 40000,
      fee: 0,
      timestamp: new Date(),
      ...data
    }
  });
}

// test-utils/setup.ts
beforeAll(async () => {
  // Set up test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
});

afterEach(async () => {
  // Clean up test data
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
});
Validation Checklist for Each Feature
When implementing a feature, ensure:

 TypeScript compiles without errors
 Unit tests pass for business logic
 API endpoint tests pass
 Component renders correctly in tests
 Manual testing works with real data
 Error cases are handled and tested
 Loading states are implemented
 Mobile responsive (test at 375px width)
Quick Test Commands
bash
Copy Code
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- portfolio.test.ts

# Run with coverage
npm test -- --coverage

# Test a specific feature
npm test -- --testNamePattern="average price"

# Run server only
cd server && npm test

# Run client only
cd client && npm test
Manual Testing Scenarios
After implementing each feature, test these scenarios:

Empty Portfolio
New user with no transactions
Should show $0 value, no holdings
Single Asset
Add 1 BTC buy at $40,000
Should show correct value and 0% P&L initially
Multiple Buys
Buy 0.5 BTC at $40,000
Buy 0.5 BTC at $50,000
Should show average price of $45,000
Buy and Sell
Buy 1 BTC at $40,000
Sell 0.5 BTC at $50,000
Should show 0.5 BTC remaining with profit
Error Cases
Invalid API key
Network timeout
Invalid transaction data
Implementation Order with Tests
Setup & Auth → Test user creation and login
Transaction CRUD → Test all CRUD operations
Portfolio Calculations → Test average price, P&L
Dashboard UI → Test component rendering
Real-time Updates → Test price refresh
CSV Import → Test file parsing and validation

## How to Use This Testing-Focused Approach

```bash
# Start with Gemini CLI
gemini

# Initial setup
> Read CRYPTOTRACK.md to understand the project. Set up the initial project with testing infrastructure included.

# For each feature, ask for tests too
> Create the transaction API endpoints with full test coverage

> Implement the portfolio calculation service and write comprehensive unit tests

> Build the portfolio dashboard component with React Testing Library tests

# Run tests as you go
> Show me how to run the tests for the transaction API

> The average price calculation test is failing. Let's debug it.

# Validate before moving on
> Run all tests and show me the results before we move to the next feature

## Feature: Email Price Alerts

**Goal:** Send an email notification to the account holder when a cryptocurrency price alert condition is met.

**Implementation Steps:**

1.  **Integrate with a Cryptocurrency Price API:**
    *   Choose a reliable cryptocurrency price API (e.g., CoinGecko, CoinMarketCap).
    *   Implement a service (`server/src/services/coin.service.ts` or a new one) to fetch current prices for specified cryptocurrencies.

2.  **Implement an Alert Monitoring Service:**
    *   Create a new service (e.g., `server/src/services/alertMonitor.service.ts`) or extend `alert.service.ts`.
    *   This service will:
        *   Periodically (e.g., every 1-5 minutes) fetch all active alerts from the database.
        *   For each alert, fetch the current price of the `coinId`.
        *   Compare the current price with `targetPrice` based on `direction` (`above` or `below`).
        *   If the condition is met, trigger an email notification.
        *   Consider marking alerts as "triggered" or "inactive" after sending an email to prevent repeated notifications for the same event.

3.  **Set up a Scheduled Task/Cron Job:**
    *   Use a library like `node-cron` or a simple `setInterval` in `server/src/index.ts` to call the alert monitoring service periodically.

4.  **Implement Email Sending:**
    *   Install an email sending library (e.g., `nodemailer`).
    *   Configure email service credentials (SMTP server, username, password) as environment variables in `server/.env`.
    *   Create an email utility function to send formatted alert emails.

5.  **Update Alert Schema (Optional but Recommended):**
    *   Consider adding fields to the `Alert` model in `prisma/schema.prisma` to track:
        *   `triggeredAt`: DateTime (when the alert was last triggered)
        *   `isActive`: Boolean (to easily enable/disable or mark as one-time triggered)

6.  **Client-side Enhancements (Future):**
    *   Display alert status (e.g., "Active", "Triggered").
    *   Allow users to enable/disable alerts from the UI.

```