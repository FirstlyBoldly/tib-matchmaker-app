import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileReader from './components/ProfileReader';
import CheckInScreen from './components/CheckInScreen';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import { USERS } from './data/users';

function App() {
  const [view, setView] = useState('checkin'); // checkin, profile_reader, dashboard, navigation
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  // Mock current user state - can be updated to simulate movement
  const [currentUser, setCurrentUser] = useState({
    id: 0,
    name: 'You',
    floor: 1,
    position: [0, 0, 0]
  });

  const handleCheckInComplete = () => {
    setView('profile_reader');
  };

  const handleProfileComplete = () => {
    setView('dashboard');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setView('navigation');
  };

  const handleBackToDashboard = () => {
    setSelectedUser(null);
    setView('dashboard');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Background 3D Map - Always present but maybe simpler during checkin */}
      <div className="full-screen" style={{ zIndex: 0 }}>
        <MapView
          mode={view}
          users={USERS}
          currentUser={currentUser}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
        />
      </div>

      {/* UI Layers */}
      <AnimatePresence>
        {view === 'profile_reader' && (
          <ProfileReader key="profile" onComplete={handleProfileComplete} />
        )}

        {view === 'checkin' && (
          <CheckInScreen key="checkin" onComplete={handleCheckInComplete} />
        )}

        {(view === 'dashboard' || view === 'navigation') && (
          <Dashboard
            key="dashboard"
            users={USERS}
            currentUser={currentUser}
            selectedUser={selectedUser}
            isPublic={isPublic}
            onTogglePublic={() => setIsPublic(!isPublic)}
            onUserSelect={handleUserSelect}
            onBack={handleBackToDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
