import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Academy from './pages/Academy';
import Sharjapur from './pages/Sharjapur';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/sharjapur" element={<Sharjapur />} />
      </Routes>
    </Router>
  );
}

export default App;
