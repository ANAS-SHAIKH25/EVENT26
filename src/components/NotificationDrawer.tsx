import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, CheckCircle2, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    openEventDetail,
  } = useApp();

  if (!notificationDrawerOpen) return null;

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Simulated Transactional Mail Log
              </h2>
              <p className="text-[11px] text-neutral-500">
                P0.5: Confirmations, updates &amp; cancellation notices
              </p>
            </div>
          </div>

          <button
            onClick={() => setNotificationDrawerOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/40">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-700">No emails dispatched yet</p>
              <p className="text-[11px] mt-1">
                RSVP to an event or cancel a reservation to view simulated transactional receipts.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isConfirm = item.type === 'rsvp_confirmation';
              const isCancel = item.type === 'rsvp_cancellation' || item.type === 'event_cancelled';

              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs text-xs space-y-3"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      {isConfirm ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      )}
                      <span className="text-neutral-800 font-semibold">{item.recipientEmail}</span>
                    </div>
                    <span className="font-mono tabular-nums text-neutral-400">
                      {formatTimestamp(item.sentAt)}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="font-bold text-neutral-900 leading-snug">
                    {item.subject}
                  </div>

                  {/* Body copy */}
                  <div className="text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-[11px] whitespace-pre-line font-mono">
                    {item.body}
                  </div>

                  {/* Reference code & link */}
                  {item.confirmationCode && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-neutral-500">
                        Code: <strong className="font-mono text-neutral-900">{item.confirmationCode}</strong>
                      </span>

                      {item.cancellationLink && (
                        <span className="text-neutral-400 font-mono text-[10px] truncate max-w-[200px]">
                          secure_cancellation_hash_ok
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => {
                        openEventDetail(item.eventId);
                        setNotificationDrawerOpen(false);
                      }}
                      className="text-xs font-semibold text-neutral-900 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500 shrink-0">
          All transactional notices are logged client-side to demonstrate the delivery pipeline.
        </div>
      </div>
    </div>
  );
};
