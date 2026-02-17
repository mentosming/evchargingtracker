import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PublicCalculator from './components/PublicCalculator';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import IntroGuide from './components/IntroGuide';
import { onAuthStateChange } from './services/firebase';
import { User, ADMIN_EMAIL } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
        if (currentUser.email !== ADMIN_EMAIL) {
          setIsAdminMode(false);
        }
      } else {
        setUser(null);
        setIsAdminMode(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Font Size Management
  useEffect(() => {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize === 'large') {
      setIsLargeText(true);
      document.documentElement.classList.add('large-text');
    } else {
      setIsLargeText(false);
      document.documentElement.classList.remove('large-text');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const toggleLargeText = () => {
    if (isLargeText) {
      document.documentElement.classList.remove('large-text');
      localStorage.setItem('fontSize', 'normal');
      setIsLargeText(false);
    } else {
      document.documentElement.classList.add('large-text');
      localStorage.setItem('fontSize', 'large');
      setIsLargeText(true);
    }
  };

  const toggleAdminMode = () => {
    if (user?.email === ADMIN_EMAIL) {
      setIsAdminMode(!isAdminMode);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      <Navbar 
        user={user} 
        isAdminMode={isAdminMode} 
        toggleAdminMode={toggleAdminMode} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        isLargeText={isLargeText} 
        toggleLargeText={toggleLargeText} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Always show Calculator unless in Admin mode. */}
        {!isAdminMode && (
          <div className="mb-8">
            <PublicCalculator />
          </div>
        )}

        <div className="transition-all duration-300">
          {!user ? (
            <IntroGuide />
          ) : isAdminMode ? (
            <AdminPanel />
          ) : (
            <UserDashboard user={user} />
          )}
        </div>
      </main>

      <footer className="text-center text-slate-400 dark:text-slate-600 text-sm mt-12 mb-6">
        <p>&copy; 2026 EV Charging Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;