import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, EventStatus } from '../types';
import {
  Plus,
  Users,
  MapPin,
  Video,
  Eye,
  Edit3,
  Calendar,
  AlertTriangle,
  FileText,
  Radio,
  Slash,
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const {
    events,
    currentUser,
    getConfirmedCount,
    setAttendeeModalEventId,
    setShowCreateEventModal,
    setEditingEvent,
    openEventDetail,
    publishEvent,
    cancelEvent,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft' | 'cancelled'>('all');
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter events owned by the organizer
  const organizerEvents = events.filter((e) => e.organizerId === currentUser.id || currentUser.role === 'organizer');

  const filteredEvents = organizerEvents.filter((e) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'published') return e.status === 'published' || e.status === 'full';
    if (activeFilter === 'draft') return e.status === 'draft';
    if (activeFilter === 'cancelled') return e.status === 'cancelled';
    return true;
  });

  // Calculate totals
  const totalEvents = organizerEvents.length;
  const publishedCount = organizerEvents.filter((e) => e.status === 'published' || e.status === 'full').length;
  const draftCount = organizerEvents.filter((e) => e.status === 'draft').length;
  const totalRSVPs = organizerEvents.reduce((acc, evt) => acc + getConfirmedCount(evt.id), 0);

  const handlePublish = (eventId: string) => {
    const res = publishEvent(eventId);
    if (res.success) {
      setActionNotice('Event published successfully! It is now live in the public discovery feed.');
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert(res.error);
    }
  };

  const confirmCancelEvent = () => {
    if (!cancellingEventId) return;
    const res = cancelEvent(cancellingEventId, cancellationReason);
    setCancellingEventId(null);
    setCancellationReason('');
    if (res.success) {
      setActionNotice('Event cancelled. All confirmed attendees have been notified.');
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Organizer Workspace</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Event Management &amp; Capacity Control
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setShowCreateEventModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {actionNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Strip (Clean, unboxed, domain-native) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Events</div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums mt-1">
            {totalEvents}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Across all lifecycles</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Live Published</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
            {publishedCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Accepting attendee RSVPs</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Confirmed Registrations</div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums mt-1">
            {totalRSVPs}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Across active events</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Unpublished Drafts</div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums mt-1">
            {draftCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">In progress</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg max-w-fit mb-6 text-xs font-medium">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          All Events ({organizerEvents.length})
        </button>
        <button
          onClick={() => setActiveFilter('published')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeFilter === 'published' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Published &amp; Full ({publishedCount})
        </button>
        <button
          onClick={() => setActiveFilter('draft')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeFilter === 'draft' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Drafts ({draftCount})
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeFilter === 'cancelled' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Events Table / List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-lg mx-auto">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-900">No events found in this view</h2>
          <p className="text-xs text-neutral-500 mt-1">
            {activeFilter === 'draft'
              ? 'You have no draft events. Create a new event to save a draft.'
              : 'Create your first event to start accepting attendee registrations.'}
          </p>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowCreateEventModal(true);
            }}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const confirmed = getConfirmedCount(event.id);
            const isFull = confirmed >= event.capacity || event.status === 'full';
            const isCancelled = event.status === 'cancelled';
            const isDraft = event.status === 'draft';
            const percentFilled = Math.min(100, Math.round((confirmed / event.capacity) * 100));

            return (
              <div
                key={event.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Event Summary Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-800">{formatDate(event.startDateTime)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize flex items-center gap-1">
                        {event.format === 'in-person' ? (
                          <MapPin className="w-3 h-3 text-neutral-400" />
                        ) : (
                          <Video className="w-3 h-3 text-neutral-400" />
                        )}
                        {event.format}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{event.category}</span>
                      <span aria-hidden="true">·</span>
                      {/* Status indicator */}
                      <span
                        className={`font-semibold ${
                          isCancelled
                            ? 'text-red-700'
                            : isDraft
                            ? 'text-amber-700'
                            : isFull
                            ? 'text-amber-800 font-bold'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isCancelled
                          ? 'Cancelled'
                          : isDraft
                          ? 'Draft (Unpublished)'
                          : isFull
                          ? 'Full (100% Capacity)'
                          : 'Published (Active)'}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                      {event.title}
                    </h2>

                    <p className="text-xs text-neutral-500 truncate max-w-2xl">
                      {event.location}
                    </p>
                  </div>

                  {/* Capacity Bar & Figures */}
                  <div className="lg:w-64 shrink-0 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-500 font-medium">Capacity Usage</span>
                      <span className="font-mono tabular-nums font-bold text-neutral-900">
                        {confirmed} / {event.capacity} ({percentFilled}%)
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCancelled
                            ? 'bg-neutral-400'
                            : isFull
                            ? 'bg-red-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5">
                      <span>{isCancelled ? 'Closed' : `${Math.max(0, event.capacity - confirmed)} left`}</span>
                      <span className="font-mono text-neutral-400">{event.timeZone.split('/')[1] || 'PST'}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    {/* View Attendee Records (Step 10) */}
                    <button
                      onClick={() => setAttendeeModalEventId(event.id)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="View attendee records for this event"
                    >
                      <Users className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Attendee Records ({confirmed})</span>
                    </button>

                    {/* View Public Page */}
                    <button
                      onClick={() => openEventDetail(event.id)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                      title="Open public event page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Event */}
                    {!isCancelled && (
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowCreateEventModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                        title="Edit event details & capacity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Publish draft */}
                    {isDraft && (
                      <button
                        onClick={() => handlePublish(event.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    {/* Cancel Event button */}
                    {!isCancelled && (
                      <button
                        onClick={() => setCancellingEventId(event.id)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Cancel this event"
                      >
                        <Slash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog (P0.8) */}
      {cancellingEventId && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Cancel this event?</h3>
                <p className="text-xs text-neutral-500">
                  This action is permanent and cannot be undone in MVP.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">
              Cancelling will immediately disable new RSVPs, display a prominent &ldquo;Cancelled&rdquo; badge on the public page, and queue automated cancellation emails to all confirmed attendees.
            </p>

            <div>
              <label htmlFor="cancel-reason-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                Reason for cancellation (included in attendee notice):
              </label>
              <textarea
                id="cancel-reason-input"
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Venue remodeling or unforeseen scheduling conflict"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  setCancellingEventId(null);
                  setCancellationReason('');
                }}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg"
              >
                Keep Event
              </button>
              <button
                onClick={confirmCancelEvent}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm &amp; Notify Attendees
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
