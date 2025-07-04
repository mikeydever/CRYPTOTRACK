import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { TransactionPage } from './pages/TransactionPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-blue-400">Dashboard</Link>
            </li>
            <li>
              <Link to="/transactions" className="hover:text-blue-400">Transactions</Link>
            </li>
            <li>
              <Link to="/alerts" className="hover:text-blue-400">Alerts</Link>
            </li>
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<PortfolioDashboard />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/alerts" element={<AlertPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;