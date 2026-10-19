import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, EventFormat } from '../types';
import { Search, MapPin, Video, Users, X, ArrowRight } from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const { events, openEventDetail, getConfirmedCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Discover only shows published, full, or cancelled upcoming events (drafts are hidden from public view!)
  const publicEvents = useMemo(() => {
    return events.filter((e) => e.status !== 'draft');
  }, [events]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    publicEvents.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [publicEvents]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return publicEvents.filter((event) => {
      // Keyword match across title and description
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      // Format filter
      const matchesFormat = selectedFormat === 'all' || event.format === selectedFormat;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

      return matchesSearch && matchesFormat && matchesCategory;
    });
  }, [publicEvents, searchQuery, selectedFormat, selectedCategory]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string, timeZone: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }) + ' ' + (timeZone.split('/')[1]?.replace('_', ' ') || 'PST');
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight text-balance">
          Discover community workshops, talks, and local gatherings
        </h1>
        <p className="mt-2 text-base text-neutral-600 max-w-2xl leading-relaxed">
          Explore independent events with guaranteed capacity enforcement. RSVP in seconds, receive verified confirmation receipts, and stay updated.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title, keyword, or venue..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-neutral-900 placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Interactive Format Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFormat === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setSelectedFormat('in-person')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedFormat === 'in-person'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MapPin className="w-3 h-3 text-neutral-500" />
              <span>In-Person</span>
            </button>
            <button
              onClick={() => setSelectedFormat('online')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedFormat === 'online'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Video className="w-3 h-3 text-neutral-500" />
              <span>Online</span>
            </button>
          </div>
        </div>

        {/* Category secondary filter row */}
        {categories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <span className="text-neutral-400 font-medium whitespace-nowrap">Filter category:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-5">
        <div>
          Showing <span className="font-semibold text-neutral-900 font-mono tabular-nums">{filteredEvents.length}</span>{' '}
          {filteredEvents.length === 1 ? 'event' : 'events'}
          {searchQuery && (
            <span>
              {' '}matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>
        {(searchQuery || selectedFormat !== 'all' || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFormat('all');
              setSelectedCategory('all');
            }}
            className="text-amber-800 hover:underline font-medium"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">No events found</h2>
          <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
            We couldn&apos;t find any events matching your current filters. Try searching with different keywords or clear your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFormat('all');
              setSelectedCategory('all');
            }}
            className="mt-5 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const confirmedCount = getConfirmedCount(event.id);
            const remainingSpots = Math.max(0, event.capacity - confirmedCount);
            const isFull = confirmedCount >= event.capacity || event.status === 'full';
            const isCancelled = event.status === 'cancelled';

            return (
              <div
                key={event.id}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
                onClick={() => openEventDetail(event.id)}
              >
                {/* Event Image Banner with styled fallback */}
                <div className="relative h-48 bg-neutral-100 overflow-hidden shrink-0">
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-6 text-center">
                      <span className="text-neutral-400 font-semibold text-sm">{event.category}</span>
                    </div>
                  )}

                  {/* Status Overlay Ribbon (WCAG Compliant) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {isCancelled ? (
                      <span className="bg-red-900/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded shadow-xs">
                        Cancelled
                      </span>
                    ) : isFull ? (
                      <span className="bg-neutral-900/90 backdrop-blur-xs text-amber-300 text-xs font-semibold px-2.5 py-1 rounded shadow-xs">
                        Full (At Capacity)
                      </span>
                    ) : remainingSpots <= 3 ? (
                      <span className="bg-amber-600/95 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded shadow-xs">
                        {remainingSpots} {remainingSpots === 1 ? 'spot' : 'spots'} left
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed Metadata Header (No static pills) */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                      <span className="font-medium text-neutral-700">{formatDate(event.startDateTime)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{event.format}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{event.category}</span>
                    </div>

                    <h2 className="text-lg font-bold text-neutral-900 group-hover:text-amber-900 transition-colors leading-snug line-clamp-2">
                      {event.title}
                    </h2>

                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Card Footer with Capacity & Action */}
                  <div className="mt-5 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono tabular-nums">
                          {confirmedCount} / {event.capacity} registered
                        </span>
                      </div>

                      <span className={`font-medium ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>
                        {isCancelled
                          ? 'Event Cancelled'
                          : isFull
                          ? 'Sold out'
                          : `${remainingSpots} spots remaining`}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden mb-3">
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventDetail(event.id);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-800 bg-neutral-50 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Details &amp; RSVP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
