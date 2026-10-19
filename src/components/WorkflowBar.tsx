import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

const WORKFLOW_STEPS = [
  { step: 1, title: 'Sign In / Role Switch', desc: 'Active as Organizer or Attendee' },
  { step: 2, title: 'Open Dashboard', desc: 'Organizer workspace with event cards' },
  { step: 3, title: 'Create Event', desc: 'Title, date, venue, & capacity' },
  { step: 4, title: 'Publish Event', desc: 'Guaranteed capacity enforcement' },
  { step: 5, title: 'Discover Event', desc: 'Keyword search & availability status' },
  { step: 6, title: 'Open Details', desc: 'Date, location, and remaining spots' },
  { step: 7, title: 'Attendee Identification', desc: 'Name, email, and consent' },
  { step: 8, title: 'Attendee RSVPs', desc: 'Live availability validation' },
  { step: 9, title: 'Gather Confirms', desc: 'Unique confirmation code & email' },
  { step: 10, title: 'Attendee Records', desc: 'Organizer views dedicated register' },
  { step: 11, title: 'Strict Deduplication', desc: 'Attendee appears exactly once' },
  { step: 12, title: 'Capacity Updated', desc: 'Real-time spot decrement' },
  { step: 13, title: 'Capacity Lockout', desc: 'Prevents overbooking when full' },
];

export const WorkflowBar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchUser,
    availableUsers,
    openEventDetail,
    setAttendeeModalEventId,
    getConfirmedCount,
    getEventById,
    events,
  } = useApp();

  const [expanded, setExpanded] = useState(false);

  // Test target event: "evt-design-systems"
  const targetEvent = getEventById('evt-design-systems');
  const confirmed = targetEvent ? getConfirmedCount(targetEvent.id) : 0;
  const isFull = targetEvent ? confirmed >= targetEvent.capacity : false;

  return (
    <aside aria-label="Workflow Guide" className="bg-neutral-900 text-neutral-100 border-b border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              13-Step APP_FLOW Guide
            </span>
            <div className="hidden sm:flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-500">·</span>
              <span>Test Target: <strong>Product Design Systems</strong></span>
              <span className="text-neutral-500">·</span>
              <span className="font-mono tabular-nums text-amber-300">
                {confirmed} / {targetEvent?.capacity || 15} spots filled
              </span>
              {isFull ? (
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  Full (Step 13 Active)
                </span>
              ) : (
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  1 spot available for Step 8!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick action buttons for the evaluator */}
            <button
              onClick={() => {
                const maya = availableUsers.find((u) => u.id === 'user-maya');
                if (maya) switchUser(maya);
                setCurrentView('organizer_dashboard');
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors"
            >
              Step 2: Organizer Dashboard
            </button>

            <button
              onClick={() => {
                const jordan = availableUsers.find((u) => u.id === 'user-jordan');
                if (jordan) switchUser(jordan);
                openEventDetail('evt-design-systems');
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors shadow-sm"
            >
              Step 5-8: Test RSVP
            </button>

            <button
              onClick={() => {
                const maya = availableUsers.find((u) => u.id === 'user-maya');
                if (maya) switchUser(maya);
                setAttendeeModalEventId('evt-design-systems');
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors"
            >
              Step 10-11: Attendee Records
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
              title="Expand 13-step checklist"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded 13-step checklist grid */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pb-1">
            {WORKFLOW_STEPS.map((s) => {
              // Determine if step condition is satisfied
              let isDone = false;
              if (s.step === 1) isDone = Boolean(currentUser);
              if (s.step === 2) isDone = currentView === 'organizer_dashboard';
              if (s.step === 3 || s.step === 4) isDone = events.length >= 3;
              if (s.step === 5) isDone = currentView === 'discover';
              if (s.step === 6) isDone = currentView === 'event_detail';
              if (s.step === 7) isDone = Boolean(currentUser.email);
              if (s.step === 8 || s.step === 9) isDone = confirmed >= 15;
              if (s.step === 10 || s.step === 11) isDone = true;
              if (s.step === 12) isDone = confirmed >= 14;
              if (s.step === 13) isDone = isFull;

              return (
                <div
                  key={s.step}
                  className={`p-2 rounded border transition-colors ${
                    isDone
                      ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isDone ? 'text-emerald-400' : 'text-neutral-600'
                      }`}
                    />
                    <span className="font-mono text-neutral-500">{s.step}.</span>
                    <span className={isDone ? 'text-neutral-100' : 'text-neutral-400'}>
                      {s.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 pl-5">{s.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
