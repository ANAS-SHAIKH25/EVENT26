import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { WorkflowBar } from './components/WorkflowBar';
import { DiscoverView } from './components/DiscoverView';
import { EventDetailView } from './components/EventDetailView';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { MyRSVPsView } from './components/MyRSVPsView';
import { CreateEventModal } from './components/CreateEventModal';
import { AttendeeRecordsModal } from './components/AttendeeRecordsModal';
import { NotificationDrawer } from './components/NotificationDrawer';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* 13-Step APP_FLOW Guide Strip */}
      <WorkflowBar />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'discover' && <DiscoverView />}
        {currentView === 'event_detail' && <EventDetailView />}
        {currentView === 'organizer_dashboard' && <OrganizerDashboard />}
        {currentView === 'my_rsvps' && <MyRSVPsView />}
      </main>

      {/* Quiet, Compliant Site Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-16 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">Gather</span>
            <span aria-hidden="true">·</span>
            <span>Events &amp; Community Platform</span>
            <span aria-hidden="true">·</span>
            <span>Strict Capacity Enforcement</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('discover')}
              className="hover:text-neutral-900 transition-colors"
            >
              Discover
            </button>
            <button
              onClick={() => setCurrentView('organizer_dashboard')}
              className="hover:text-neutral-900 transition-colors"
            >
              Organizer Workspace
            </button>
            <button
              onClick={() => setCurrentView('my_rsvps')}
              className="hover:text-neutral-900 transition-colors"
            >
              My RSVPs
            </button>
            <span>&copy; 2026 Gather Community</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <CreateEventModal />
      <AttendeeRecordsModal />
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
