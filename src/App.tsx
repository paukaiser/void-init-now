import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LoginButton from './components/LoginButton.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Inbox from './pages/Inbox.tsx'; // <-- ADD THIS LINE
import MeetingActions from './pages/MeetingActions.tsx';
import MeetingCanceled from './pages/MeetingCanceled.tsx';
import { MeetingProvider } from './context/MeetingContext.tsx';
import './App.css';
import AddMeeting from './pages/AddMeeting.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/hubspot-data', {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <MeetingProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <LoginButton />
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" />
            }
          />
          {/* 📨 Inbox/Tasks route */}
          <Route
            path="/inbox"
            element={
              isAuthenticated ? <Inbox /> : <Navigate to="/" />
            }
          />
          <Route
            path="/meeting/:id"
            element={
              isAuthenticated ? <MeetingActions /> : <Navigate to="/" />
            }
          />
          <Route
            path="/add-meeting"
            element={isAuthenticated ? <AddMeeting /> : <Navigate to="/" />}
          />
          <Route
            path="/meeting-canceled"
            element={<MeetingCanceled />}
          />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </MeetingProvider>
  );
}

export default App;
