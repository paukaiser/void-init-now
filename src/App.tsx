import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LoginButton from './components/LoginButton.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Inbox from './pages/Inbox.tsx';
import MeetingActions from './pages/MeetingActions.tsx';
import MeetingCanceled from './pages/MeetingCanceled.tsx';
import AddMeeting from './pages/AddMeeting.tsx';
import MeetingOutcome from './pages/MeetingOutcome.tsx';
import PositiveOutcome from './pages/PositiveOutcome.tsx';      // <--- Import
import NegativeOutcome from './pages/NegativeOutcome.tsx';      // <--- Import
import FollowUpOutcome from './pages/FollowUpOutcome.tsx';      // <--- Import
// import FollowUpComponent from './pages/FollowUpComponent.tsx'; // <-- if you have this

import { MeetingProvider } from './context/MeetingContext.tsx';
import './App.css';

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
          <Route
            path="/meeting/:id/outcome"
            element={isAuthenticated ? <MeetingOutcome /> : <Navigate to="/" />}
          />
          <Route
            path="/meeting/:id/follow-up"
            element={isAuthenticated ? <FollowUpOutcome /> : <Navigate to="/" />}
          />
          {/* Outcome-specific routes */}
          <Route
            path="/meeting/:id/positive"
            element={isAuthenticated ? <PositiveOutcome /> : <Navigate to="/" />}
          />
          <Route
            path="/meeting/:id/negative"
            element={isAuthenticated ? <NegativeOutcome /> : <Navigate to="/" />}
          />
          {/* Optional: Follow-up route if needed */}
          {/* <Route
            path="/meeting/:id/follow-up"
            element={isAuthenticated ? <FollowUpComponent /> : <Navigate to="/" />}
          /> */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </MeetingProvider>
  );
}

export default App;
