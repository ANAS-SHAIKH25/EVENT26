import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Share2,
  ShieldAlert,
  UserCheck,
  Check,
  Copy,
} from 'lucide-react';

export const EventDetailView: React.FC = () => {
  const {
    selectedEventId,
    getEventById,
    getConfirmedCount,
    setCurrentView,
    currentUser,
    submitRSVP,
    cancelRSVP,
    getUserRSVPForEvent,
    setNotificationDrawerOpen,
  } = useApp();

  const event = selectedEventId ? getEventById(selectedEventId) : undefined;

  // Form states
  const [attendeeName, setAttendeeName] = useState(currentUser?.name || 'Jordan Malik');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || 'jordan.malik@example.com');
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [justConfirmedCode, setJustConfirmedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Event Not Found</h2>
        <p className="text-sm text-neutral-500 mt-2">The requested event could not be located or may have been removed.</p>
        <button
          onClick={() => setCurrentView('discover')}
          className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
        >
          Return to Events Discovery
        </button>
      </div>
    );
  }

  const confirmedCount = getConfirmedCount(event.id);
  const remainingSpots = Math.max(0, event.capacity - confirmedCount);
  const isFull = confirmedCount >= event.capacity || event.status === 'full';
  const isCancelled = event.status === 'cancelled';
  const isDraft = event.status === 'draft';

  // Check if current user already has a confirmed RSVP
  const activeUserRSVP = getUserRSVPForEvent(event.id, attendeeEmail);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeRange = (startStr: string, endStr: string, timeZone: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const tzName = timeZone.split('/')[1]?.replace('_', ' ') || 'PST';
      return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${tzName})`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!attendeeName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!attendeeEmail.trim() || !emailRegex.test(attendeeEmail.trim())) {
      setFormError('Please enter a syntactically valid email address.');
      return;
    }

    if (!consentAcknowledged) {
      setFormError('Please acknowledge the event administration notice.');
      return;
    }

    setIsSubmitting(true);

    // Simulate standard brief latency (300ms) for validation & confirmation
    setTimeout(() => {
      const result = submitRSVP(event.id, attendeeName, attendeeEmail);
      setIsSubmitting(false);

      if (result.success) {
        setJustConfirmedCode(result.code || null);
        setFormError(null);
      } else {
        setFormError(result.message);
      }
    }, 250);
  };

  const handleCancelMyRSVP = () => {
    if (!activeUserRSVP) return;
    const res = cancelRSVP(activeUserRSVP.id);
    setShowCancelPrompt(false);
    setJustConfirmedCode(null);
    if (!res.success) {
      setFormError(res.message);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all events</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-neutral-500" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
        </button>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Event Overview, Details, Host */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Status */}
          <div>
            {/* Unboxed Metadata (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
              <span className="font-semibold text-neutral-800">{event.category}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{event.format} Event</span>
              <span aria-hidden="true">·</span>
              <span>Host: {event.organizerName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight text-balance">
              {event.title}
            </h1>
          </div>

          {/* Hero Banner Image */}
          {event.coverImage && (
            <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-xs h-64 sm:h-80 bg-neutral-100">
              <img
                src={event.coverImage}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Key Logistics Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider text-xs">
              Event Logistics &amp; Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-900">Date</div>
                  <div className="text-neutral-600 mt-0.5">{formatDate(event.startDateTime)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-900">Time &amp; Zone</div>
                  <div className="text-neutral-600 mt-0.5">
                    {formatTimeRange(event.startDateTime, event.endDateTime, event.timeZone)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                {event.format === 'in-person' ? (
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                ) : (
                  <Video className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-neutral-900">
                    {event.format === 'in-person' ? 'Physical Venue & Address' : 'Online Stream & Access'}
                  </div>
                  <div className="text-neutral-600 mt-0.5 leading-relaxed">{event.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 mb-3">About this event</h2>
            <div className="text-sm text-neutral-700 leading-relaxed space-y-3 whitespace-pre-line">
              {event.description}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                {event.organizerName.charAt(0)}
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Hosted by {event.organizerName}</div>
                <div className="text-neutral-500">{event.organizerEmail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sticky RSVP Card & Capacity Enforcement */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            {/* Capacity Meter Header */}
            <div className="mb-5 pb-5 border-b border-neutral-100">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                  Registration Capacity
                </span>
                <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                  {confirmedCount} / {event.capacity}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCancelled
                      ? 'bg-neutral-300'
                      : isFull
                      ? 'bg-red-600'
                      : 'bg-emerald-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {isCancelled ? 'Status: Cancelled' : isDraft ? 'Status: Draft' : isFull ? 'Status: Full' : 'Status: Open'}
                </span>
                <span
                  className={`font-semibold ${
                    isCancelled
                      ? 'text-red-700'
                      : isFull
                      ? 'text-red-700 font-bold'
                      : remainingSpots <= 3
                      ? 'text-amber-800'
                      : 'text-emerald-700'
                  }`}
                >
                  {isCancelled
                    ? 'Registration closed'
                    : isFull
                    ? 'No spots remaining'
                    : `${remainingSpots} ${remainingSpots === 1 ? 'spot' : 'spots'} available`}
                </span>
              </div>
            </div>

            {/* State A: Event is Cancelled */}
            {isCancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Event Cancelled</span>
                </div>
                <p className="text-red-800 leading-relaxed">
                  The organizer has officially cancelled this event. All confirmed attendees have been notified by email. RSVPs are permanently closed.
                </p>
              </div>
            ) : isDraft ? (
              /* State B: Event is a Draft */
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Unpublished Draft</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  This event is currently in draft mode and not visible in public listings. Publish the event from your Organizer Dashboard to begin accepting RSVPs.
                </p>
              </div>
            ) : activeUserRSVP ? (
              /* State C: User already has a confirmed RSVP (Step 9 & 11) */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your RSVP is Confirmed!</span>
                  </div>
                  <p className="text-emerald-800 text-xs mb-3">
                    Your spot is secured. Confirmation reference:
                  </p>
                  <div className="bg-white border border-emerald-300 rounded px-3 py-2 text-center font-mono font-bold text-emerald-900 text-sm tracking-wider shadow-2xs">
                    {activeUserRSVP.confirmationCode}
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    Registered on{' '}
                    {new Date(activeUserRSVP.registeredAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setNotificationDrawerOpen(true)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Preview Confirmation Email</span>
                  </button>

                  {!showCancelPrompt ? (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      className="w-full py-2 px-3 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-center"
                    >
                      Unable to attend? Cancel your RSVP
                    </button>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-2">
                      <p className="text-red-900 font-semibold">
                        Are you sure you want to cancel your reservation?
                      </p>
                      <p className="text-red-700 text-[11px]">
                        Your place will be released immediately for other attendees.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleCancelMyRSVP}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors text-xs"
                        >
                          Confirm Cancellation
                        </button>
                        <button
                          onClick={() => setShowCancelPrompt(false)}
                          className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded transition-colors text-xs"
                        >
                          Keep RSVP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isFull ? (
              /* State D: Event is at Full Capacity (Step 13) */
              <div className="bg-neutral-900 text-neutral-100 rounded-lg p-5 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Event Reached Full Capacity</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-xs">
                  All <span className="font-mono font-bold text-white">{event.capacity}</span> spots for this event have been claimed. In accordance with Gather&apos;s capacity integrity rule, no further RSVPs can be accepted at this time.
                </p>
                <div className="p-2.5 bg-neutral-800 rounded border border-neutral-700 text-[11px] text-neutral-400">
                  If another registered attendee cancels their reservation, a spot will automatically open back up for discovery.
                </div>
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 text-neutral-500 font-semibold cursor-not-allowed border border-neutral-700 text-center"
                >
                  Registration Closed (Full)
                </button>
              </div>
            ) : (
              /* State E: Open for RSVP (Steps 7 & 8) */
              <form onSubmit={handleRSVPSubmit} className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Reserve Your Free Spot
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Quick confirmation. No payment required.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="attendee-name-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="attendee-name-input"
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="e.g. Jordan Malik"
                    required
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
                  />
                </div>

                <div>
                  <label htmlFor="attendee-email-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="attendee-email-input"
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="e.g. jordan.malik@example.com"
                    required
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Your confirmation reference and updates will be sent here.
                  </p>
                </div>

                {/* Consent Acknowledgment Checkbox (P0.4 requirement) */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={consentAcknowledged}
                    onChange={(e) => setConsentAcknowledged(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-neutral-600 leading-tight">
                    I acknowledge that the organizer will use my name and email to administer this event.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Verifying Capacity &amp; Reserving...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm Free RSVP</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-neutral-400 text-center">
                  Instant confirmation · 1 RSVP per person · Guaranteed capacity
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
