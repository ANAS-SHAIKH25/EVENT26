import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const MyRSVPsView: React.FC = () => {
  const {
    rsvps,
    currentUser,
    getEventById,
    openEventDetail,
    cancelRSVP,
    setCurrentView,
    setNotificationDrawerOpen,
  } = useApp();

  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);

  const userRSVPs = rsvps.filter(
    (r) => r.attendeeEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const confirmedRSVPs = userRSVPs.filter((r) => r.status === 'confirmed');
  const pastCancelledRSVPs = userRSVPs.filter((r) => r.status === 'cancelled');

  const handleCancel = (rsvpId: string) => {
    cancelRSVP(rsvpId);
    setCancelPromptId(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <span>Attendee Profile</span>
          <span aria-hidden="true">·</span>
          <span>{currentUser.email}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          My Event Registrations
        </h1>
        <p className="text-xs text-neutral-600 mt-1">
          Manage your confirmed places, retrieve verification codes, and cancel if plans change.
        </p>
      </div>

      {userRSVPs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-lg mx-auto">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-900">No event registrations found</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            You haven&apos;t reserved a place for any events under {currentUser.email} yet.
          </p>
          <button
            onClick={() => setCurrentView('discover')}
            className="mt-5 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Discover Events &amp; RSVP
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Confirmed Registrations */}
          <div>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Confirmed Reservations ({confirmedRSVPs.length})
            </h2>

            {confirmedRSVPs.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center text-xs text-neutral-500">
                You have no active confirmed RSVPs.
              </div>
            ) : (
              <div className="space-y-4">
                {confirmedRSVPs.map((rsvp) => {
                  const event = getEventById(rsvp.eventId);
                  if (!event) return null;

                  return (
                    <div
                      key={rsvp.id}
                      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="font-semibold text-neutral-800">
                            {formatDate(event.startDateTime)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{event.format}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Confirmed
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-neutral-900 truncate">
                          {event.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          {event.format === 'in-person' ? (
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          ) : (
                            <Video className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          )}
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {/* Confirmation Code & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-center">
                          <div className="text-[10px] text-neutral-400 font-mono">Reference Code</div>
                          <div className="font-mono font-bold text-xs text-neutral-900 tracking-wider">
                            {rsvp.confirmationCode}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEventDetail(event.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition-colors flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                          </button>

                          {cancelPromptId === rsvp.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCancel(rsvp.id)}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                              >
                                Confirm Cancel
                              </button>
                              <button
                                onClick={() => setCancelPromptId(null)}
                                className="px-2 py-1.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded text-xs"
                              >
                                Back
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCancelPromptId(rsvp.id)}
                              className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              Cancel RSVP
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Cancelled Registrations */}
          {pastCancelledRSVPs.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Cancelled Registrations ({pastCancelledRSVPs.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {pastCancelledRSVPs.map((rsvp) => {
                  const event = getEventById(rsvp.eventId);
                  return (
                    <div
                      key={rsvp.id}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-neutral-800">{event?.title || 'Event'}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          Cancelled · Ref: {rsvp.confirmationCode}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {rsvp.cancelledAt ? new Date(rsvp.cancelledAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
