import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, EventFormat } from '../types';
import { X, Calendar, Clock, MapPin, Video, Users, AlertCircle, Sparkles } from 'lucide-react';

const TIME_ZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'UTC',
];

const CATEGORIES = [
  'Design & UX',
  'Community',
  'Engineering',
  'Publishing',
  'Entrepreneurship',
  'Art & Culture',
  'Workshop',
];

export const CreateEventModal: React.FC = () => {
  const {
    showCreateEventModal,
    setShowCreateEventModal,
    editingEvent,
    setEditingEvent,
    createEvent,
    updateEvent,
    getConfirmedCount,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<EventFormat>('in-person');
  const [location, setLocation] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [timeZone, setTimeZone] = useState('America/Los_Angeles');
  const [capacity, setCapacity] = useState<number>(20);
  const [category, setCategory] = useState('Design & UX');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default initial date values (e.g. next month)
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setFormat(editingEvent.format);
      setLocation(editingEvent.location);
      setStartDateTime(editingEvent.startDateTime.slice(0, 16));
      setEndDateTime(editingEvent.endDateTime.slice(0, 16));
      setTimeZone(editingEvent.timeZone);
      setCapacity(editingEvent.capacity);
      setCategory(editingEvent.category || 'Community');
    } else {
      // Default new event values
      const now = new Date();
      now.setDate(now.getDate() + 14); // 2 weeks out
      now.setHours(10, 0, 0, 0);
      const startStr = now.toISOString().slice(0, 16);

      now.setHours(12, 30, 0, 0);
      const endStr = now.toISOString().slice(0, 16);

      setTitle('');
      setDescription('');
      setFormat('in-person');
      setLocation('');
      setStartDateTime(startStr);
      setEndDateTime(endStr);
      setTimeZone('America/Los_Angeles');
      setCapacity(25);
      setCategory('Community');
    }
    setErrorMsg(null);
  }, [editingEvent, showCreateEventModal]);

  if (!showCreateEventModal) return null;

  const currentConfirmed = editingEvent ? getConfirmedCount(editingEvent.id) : 0;

  const validateForm = () => {
    if (!title.trim()) return 'Event title is required.';
    if (!location.trim()) {
      return format === 'in-person'
        ? 'Physical venue address is required.'
        : 'Online meeting URL or joining instruction is required.';
    }
    if (!startDateTime) return 'Start date and time is required.';
    if (!endDateTime) return 'End date and time is required.';

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      return 'Event end time must be after the start time.';
    }

    if (!capacity || capacity < 1 || !Number.isInteger(Number(capacity))) {
      return 'Capacity must be a positive whole number greater than zero.';
    }

    if (editingEvent && capacity < currentConfirmed) {
      return `Capacity cannot be reduced below current confirmed attendees (${currentConfirmed}).`;
    }

    return null;
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Event title is required to save a draft.');
      return;
    }

    if (editingEvent) {
      const res = updateEvent(editingEvent.id, {
        title,
        description,
        format,
        location,
        startDateTime,
        endDateTime,
        timeZone,
        capacity: Number(capacity),
        category,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update event.');
        return;
      }
    } else {
      createEvent(
        {
          title,
          description: description || 'Details coming soon.',
          format,
          location: location || 'TBD Venue',
          startDateTime,
          endDateTime,
          timeZone,
          capacity: Number(capacity) || 20,
          category,
          status: 'draft',
        },
        false // Save as draft
      );
    }

    setShowCreateEventModal(false);
    setEditingEvent(null);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    if (editingEvent) {
      const res = updateEvent(editingEvent.id, {
        title,
        description,
        format,
        location,
        startDateTime,
        endDateTime,
        timeZone,
        capacity: Number(capacity),
        category,
        status: editingEvent.status === 'draft' ? 'published' : editingEvent.status,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update event.');
        return;
      }
    } else {
      createEvent(
        {
          title,
          description,
          format,
          location,
          startDateTime,
          endDateTime,
          timeZone,
          capacity: Number(capacity),
          category,
          status: 'published',
        },
        true // Publish immediately
      );
    }

    setShowCreateEventModal(false);
    setEditingEvent(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
              <span>{editingEvent ? 'Edit Event Details' : 'Step 3 & 4: Create Event'}</span>
              <span aria-hidden="true">·</span>
              <span>Host: {currentUser.name}</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              {editingEvent ? `Edit: ${editingEvent.title}` : 'Publish a New Event with Capacity'}
            </h2>
          </div>

          <button
            onClick={() => {
              setShowCreateEventModal(false);
              setEditingEvent(null);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="event-title-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contemporary Typography & Editorial Design Workshop"
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 font-medium"
              required
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category-select" className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Category
              </label>
              <select
                id="event-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Format <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('in-person')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    format === 'in-person'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>In-Person</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('online')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    format === 'online'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Online</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location / Meeting link */}
          <div>
            <label htmlFor="event-location-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              {format === 'in-person' ? 'Physical Venue Address' : 'Online Joining URL / Instructions'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="event-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                format === 'in-person'
                  ? 'e.g. The Foundry, 450 Mission St, 4th Floor, San Francisco, CA'
                  : 'e.g. Gather Interactive Room (link sent to confirmed RSVPs)'
              }
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
              required
            />
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="event-start-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                Start Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                id="event-start-input"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label htmlFor="event-end-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                End Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                id="event-end-input"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label htmlFor="event-timezone-select" className="block text-xs font-semibold text-neutral-700 mb-1">
                Time Zone <span className="text-red-500">*</span>
              </label>
              <select
                id="event-timezone-select"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 font-mono text-[11px]"
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity Limit (Step 4 & P0.4) */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label htmlFor="event-capacity-input" className="block text-xs font-bold text-neutral-900">
                  Total Capacity Limit <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Gather automatically stops accepting registrations once this maximum capacity is reached (Step 13).
                </p>
                {editingEvent && currentConfirmed > 0 && (
                  <p className="text-[11px] font-semibold text-amber-900 mt-1">
                    Cannot be set lower than existing confirmed attendees ({currentConfirmed}).
                  </p>
                )}
              </div>

              <div className="w-28 shrink-0">
                <input
                  id="event-capacity-input"
                  type="number"
                  min={currentConfirmed > 0 ? currentConfirmed : 1}
                  max={5000}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono tabular-nums bg-white border border-neutral-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-desc-textarea" className="block text-xs font-semibold text-neutral-700 mb-1">
              Event Description &amp; Agenda
            </label>
            <textarea
              id="event-desc-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what attendees will learn, what to bring, and any preparation..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
            />
          </div>
        </form>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            Save as Draft
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateEventModal(false);
                setEditingEvent(null);
              }}
              className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              {editingEvent ? 'Save Changes' : 'Publish Event with Capacity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
