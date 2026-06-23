// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import BillingPOS from './components/BillingPOS';
import LabOrderTracker from './components/LabOrderTracker';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Simple Global Navigation Header */}
        <nav className="bg-blue-900 text-white p-4 shadow-md z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">OPTICAL ERP</h1>
            <div className="space-x-6 text-lg font-medium">
              <Link to="/pos" className="hover:text-blue-300 transition">Billing POS</Link>
              <Link to="/lab-tracker" className="hover:text-blue-300 transition">Lab Tracker</Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/pos" />} />
            <Route path="/pos" element={<BillingPOS />} />
            <Route path="/lab-tracker" element={<LabOrderTracker />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;