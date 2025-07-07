import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { TransactionPage } from './pages/TransactionPage';
import { AlertPage } from './pages/AlertPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { logoutUser, fetchUserProfile } from './services/auth.service';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchUserProfile();
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
          <ul className="flex space-x-4">
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/" className="hover:text-blue-400">Dashboard</Link>
                </li>
                <li>
                  <Link to="/transactions" className="hover:text-blue-400">Transactions</Link>
                </li>
                <li>
                  <Link to="/alerts" className="hover:text-blue-400">Alerts</Link>
                </li>
              </>
            )}
          </ul>
          <div>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Logout
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</Link>
                <Link to="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Register</Link>
              </div>
            )}
          </div>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            {isAuthenticated ? (
              <>
                <Route path="/" element={<PortfolioDashboard />} />
                <Route path="/transactions" element={<TransactionPage />} />
                <Route path="/alerts" element={<AlertPage />} />
              </>
            ) : (
              <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;