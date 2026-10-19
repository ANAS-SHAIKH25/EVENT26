import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Search,
  Users,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mail,
} from 'lucide-react';

export const AttendeeRecordsModal: React.FC = () => {
  const {
    attendeeModalEventId,
    setAttendeeModalEventId,
    getEventById,
    getEventRSVPs,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [copiedExport, setCopiedExport] = useState(false);

  const event = attendeeModalEventId ? getEventById(attendeeModalEventId) : null;
  const allRSVPs = attendeeModalEventId ? getEventRSVPs(attendeeModalEventId) : [];

  const confirmedCount = allRSVPs.filter((r) => r.status === 'confirmed').length;
  const cancelledCount = allRSVPs.filter((r) => r.status === 'cancelled').length;

  const filteredRSVPs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allRSVPs.filter((r) => {
      const matchesSearch =
        !query ||
        r.attendeeName.toLowerCase().includes(query) ||
        r.attendeeEmail.toLowerCase().includes(query) ||
        r.confirmationCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allRSVPs, searchQuery, statusFilter]);

  if (!event) return null;

  const handleExportCSV = () => {
    const headers = ['Attendee Name', 'Email', 'Status', 'Confirmation Code', 'Registered At', 'Cancelled At'];
    const rows = allRSVPs.map((r) => [
      `"${r.attendeeName}"`,
      `"${r.attendeeEmail}"`,
      r.status,
      r.confirmationCode,
      r.registeredAt,
      r.cancelledAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${event.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

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
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
              <span>Attendee Register</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{event.category}</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 truncate max-w-xl">
              {event.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>{copiedExport ? 'Downloaded CSV' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => setAttendeeModalEventId(null)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capacity & Deduplication Banner */}
        <div className="px-6 py-3 bg-neutral-100/70 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Confirmed:</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {confirmedCount} / {event.capacity}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Cancelled:</span>
              <span className="font-mono tabular-nums font-medium text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {cancelledCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Available:</span>
              <span className="font-mono tabular-nums font-medium text-emerald-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {Math.max(0, event.capacity - confirmedCount)}
              </span>
            </div>
          </div>

          {/* Strict Deduplication Guarantee Pill/Callout */}
          <div className="flex items-center gap-1.5 text-neutral-600 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Deduplication: 1 record per email address</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by attendee name, email, or confirmation code..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({allRSVPs.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'confirmed' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'cancelled' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Attendee Table */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {filteredRSVPs.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-700">No attendee records found</p>
              <p className="mt-1">
                {searchQuery
                  ? 'Try clearing your search query.'
                  : 'No attendees have registered for this event yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 sticky top-0 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Attendee Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Registration Time</th>
                  <th className="py-2.5 px-4">Confirmation Code</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRSVPs.map((record) => {
                  const isConfirmed = record.status === 'confirmed';

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        !isConfirmed ? 'opacity-60 bg-neutral-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                            {record.attendeeName.charAt(0)}
                          </div>
                          <span>{record.attendeeName}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-neutral-600 whitespace-nowrap font-mono text-[11px]">
                        {record.attendeeEmail}
                      </td>

                      <td className="py-2.5 px-4 text-neutral-500 whitespace-nowrap font-mono tabular-nums text-[11px]">
                        {formatTimestamp(record.registeredAt)}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-medium text-neutral-800 whitespace-nowrap text-[11px]">
                        {record.confirmationCode}
                      </td>

                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded text-[11px] border border-neutral-200">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <div>
            Showing <span className="font-semibold text-neutral-800 font-mono tabular-nums">{filteredRSVPs.length}</span>{' '}
            of <span className="font-semibold text-neutral-800 font-mono tabular-nums">{allRSVPs.length}</span> records
          </div>

          <button
            onClick={() => setAttendeeModalEventId(null)}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
