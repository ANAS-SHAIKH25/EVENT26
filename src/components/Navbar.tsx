import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Calendar, Compass, Shield, User, RefreshCw, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchUser,
    availableUsers,
    notifications,
    setNotificationDrawerOpen,
    setShowCreateEventModal,
    setEditingEvent,
    resetDemoData,
    rsvps,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const myRsvpCount = rsvps.filter(
    (r) => r.attendeeEmail.toLowerCase() === currentUser.email.toLowerCase() && r.status === 'confirmed'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setCurrentView('discover')}
            className="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors flex items-center gap-2 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              G
            </span>
            <span>Gather</span>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => setCurrentView('discover')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                currentView === 'discover'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900'
                  : ''
              }`}
            >
              <Compass className="w-4 h-4 text-neutral-500" />
              <span>Discover Events</span>
            </button>

            <button
              onClick={() => setCurrentView('organizer_dashboard')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                currentView === 'organizer_dashboard'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900'
                  : ''
              }`}
            >
              <Shield className="w-4 h-4 text-neutral-500" />
              <span>Organizer Workspace</span>
            </button>

            <button
              onClick={() => setCurrentView('my_rsvps')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                currentView === 'my_rsvps'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900'
                  : ''
              }`}
            >
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>My Registrations</span>
              {myRsvpCount > 0 && (
                <span className="ml-1 text-xs font-mono font-semibold px-1.5 py-0.2 bg-neutral-200 text-neutral-800 rounded">
                  {myRsvpCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1"
              title="Dispatched transactional emails and notices"
            >
              <Mail className="w-4 h-4 text-neutral-500" />
              <span>Notification Log</span>
              {notifications.length > 0 && (
                <span className="ml-1 text-xs font-mono font-medium text-neutral-600">
                  ({notifications.length})
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action + role profile switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser.role === 'organizer' ? (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowCreateEventModal(true);
                }}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                + Create Event
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('discover')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Browse & RSVP
              </button>
            )}

            {/* Quick Profile / Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left text-xs"
              >
                <div className="hidden lg:block">
                  <div className="font-semibold text-neutral-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-neutral-500 capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-xs font-medium text-neutral-500">Switch User Role for Testing</p>
                    <p className="text-xs text-neutral-400">Instantly test Organizer vs Attendee journeys</p>
                  </div>
                  <div className="py-1">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user);
                          setUserMenuOpen(false);
                          if (user.role === 'organizer') {
                            setCurrentView('organizer_dashboard');
                          } else {
                            setCurrentView('discover');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 text-xs transition-colors ${
                          user.id === currentUser.id ? 'bg-amber-50 text-neutral-900 font-medium' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-700 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-900">{user.name}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              {user.role}
                            </span>
                          </div>
                          <span className="text-neutral-500 text-[11px] truncate block">{user.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs text-neutral-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-neutral-400" />
                      <span>Reset Demo Data to Initial State</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-100 text-xs text-neutral-600">
          <button
            onClick={() => setCurrentView('discover')}
            className={`py-1 px-2 font-medium ${currentView === 'discover' ? 'text-neutral-900 font-bold' : ''}`}
          >
            Discover
          </button>
          <button
            onClick={() => setCurrentView('organizer_dashboard')}
            className={`py-1 px-2 font-medium ${currentView === 'organizer_dashboard' ? 'text-neutral-900 font-bold' : ''}`}
          >
            Organizer
          </button>
          <button
            onClick={() => setCurrentView('my_rsvps')}
            className={`py-1 px-2 font-medium ${currentView === 'my_rsvps' ? 'text-neutral-900 font-bold' : ''}`}
          >
            My RSVPs ({myRsvpCount})
          </button>
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="py-1 px-2 font-medium"
          >
            Emails ({notifications.length})
          </button>
        </div>
      </div>
    </header>
  );
};
