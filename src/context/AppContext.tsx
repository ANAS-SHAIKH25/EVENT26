import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, RSVPRecord, UserProfile, NotificationItem, EventStatus } from '../types';
import { INITIAL_EVENTS, INITIAL_RSVPS, INITIAL_USERS, INITIAL_NOTIFICATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  EVENTS: 'gather_events_v1',
  RSVPS: 'gather_rsvps_v1',
  CURRENT_USER: 'gather_current_user_v1',
  NOTIFICATIONS: 'gather_notifications_v1',
};

interface AppContextType {
  events: EventItem[];
  rsvps: RSVPRecord[];
  currentUser: UserProfile;
  notifications: NotificationItem[];
  currentView: 'discover' | 'event_detail' | 'organizer_dashboard' | 'my_rsvps';
  selectedEventId: string | null;
  showCreateEventModal: boolean;
  editingEvent: EventItem | null;
  attendeeModalEventId: string | null;
  notificationDrawerOpen: boolean;
  workflowStep: number;
  availableUsers: UserProfile[];

  // Actions
  setCurrentView: (view: 'discover' | 'event_detail' | 'organizer_dashboard' | 'my_rsvps') => void;
  setSelectedEventId: (id: string | null) => void;
  openEventDetail: (id: string) => void;
  setShowCreateEventModal: (open: boolean) => void;
  setEditingEvent: (event: EventItem | null) => void;
  setAttendeeModalEventId: (id: string | null) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  switchUser: (user: UserProfile) => void;
  setWorkflowStep: (step: number) => void;
  
  createEvent: (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt' | 'organizerId' | 'organizerName' | 'organizerEmail'>, publishImmediately?: boolean) => EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => { success: boolean; error?: string };
  publishEvent: (id: string) => { success: boolean; error?: string };
  cancelEvent: (id: string, reason?: string) => { success: boolean; error?: string };
  
  submitRSVP: (eventId: string, name: string, email: string) => { success: boolean; message: string; record?: RSVPRecord; code?: string };
  cancelRSVP: (rsvpId: string) => { success: boolean; message: string };
  
  // Helpers
  getEventById: (id: string) => EventItem | undefined;
  getConfirmedCount: (eventId: string) => number;
  getEventRSVPs: (eventId: string) => RSVPRecord[];
  getUserRSVPForEvent: (eventId: string, email: string) => RSVPRecord | undefined;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      return saved ? JSON.parse(saved) : INITIAL_RSVPS;
    } catch {
      return INITIAL_RSVPS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Maya Chen (Organizer)
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentView, setCurrentView] = useState<'discover' | 'event_detail' | 'organizer_dashboard' | 'my_rsvps'>('discover');
  const [selectedEventId, setSelectedEventId] = useState<string | null>('evt-design-systems');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [attendeeModalEventId, setAttendeeModalEventId] = useState<string | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<number>(1);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Sync event statuses with capacity in real-time
  useEffect(() => {
    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.status === 'cancelled' || evt.status === 'draft') return evt;
        const confirmed = rsvps.filter((r) => r.eventId === evt.id && r.status === 'confirmed').length;
        if (confirmed >= evt.capacity && evt.status !== 'full') {
          return { ...evt, status: 'full' };
        } else if (confirmed < evt.capacity && evt.status === 'full') {
          return { ...evt, status: 'published' };
        }
        return evt;
      })
    );
  }, [rsvps]);

  const getConfirmedCount = (eventId: string) => {
    return rsvps.filter((r) => r.eventId === eventId && r.status === 'confirmed').length;
  };

  const getEventRSVPs = (eventId: string) => {
    return rsvps.filter((r) => r.eventId === eventId);
  };

  const getEventById = (id: string) => {
    return events.find((e) => e.id === id);
  };

  const getUserRSVPForEvent = (eventId: string, email: string) => {
    return rsvps.find(
      (r) => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase() && r.status === 'confirmed'
    );
  };

  const openEventDetail = (id: string) => {
    setSelectedEventId(id);
    setCurrentView('event_detail');
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'organizer' && currentView === 'discover') {
      // Stay or let user navigate
    }
  };

  const createEvent = (
    data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt' | 'organizerId' | 'organizerName' | 'organizerEmail'>,
    publishImmediately: boolean = true
  ): EventItem => {
    const newId = `evt-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newStatus: EventStatus = publishImmediately ? 'published' : 'draft';

    const newEvent: EventItem = {
      ...data,
      id: newId,
      status: newStatus,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerEmail: currentUser.email,
      createdAt: now,
      updatedAt: now,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setWorkflowStep(4);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventItem>): { success: boolean; error?: string } => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return { success: false, error: 'Event not found.' };

    // Capacity restriction: Cannot reduce capacity below current confirmed attendees
    if (updates.capacity !== undefined) {
      const confirmed = getConfirmedCount(id);
      if (updates.capacity < confirmed) {
        return {
          success: false,
          error: `Cannot reduce capacity to ${updates.capacity}. There are already ${confirmed} confirmed attendees.`,
        };
      }
    }

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates, updatedAt: new Date().toISOString() };
          // Check if full status should change
          const confirmed = getConfirmedCount(id);
          if (updated.status !== 'cancelled' && updated.status !== 'draft') {
            if (confirmed >= updated.capacity) {
              updated.status = 'full';
            } else if (updated.status === 'full' && confirmed < updated.capacity) {
              updated.status = 'published';
            }
          }
          return updated;
        }
        return e;
      })
    );

    return { success: true };
  };

  const publishEvent = (id: string): { success: boolean; error?: string } => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return { success: false, error: 'Event not found' };

    if (!existing.title.trim() || !existing.location.trim() || !existing.startDateTime) {
      return { success: false, error: 'Title, location, and start time are required before publishing.' };
    }

    const confirmed = getConfirmedCount(id);
    const targetStatus: EventStatus = confirmed >= existing.capacity ? 'full' : 'published';

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: targetStatus, updatedAt: new Date().toISOString() } : e))
    );
    setWorkflowStep(4);
    return { success: true };
  };

  const cancelEvent = (id: string, reason?: string): { success: boolean; error?: string } => {
    const target = events.find((e) => e.id === id);
    if (!target) return { success: false, error: 'Event not found' };

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'cancelled', updatedAt: new Date().toISOString() } : e))
    );

    // Notify all confirmed attendees
    const confirmedAttendees = rsvps.filter((r) => r.eventId === id && r.status === 'confirmed');
    const newNotifications: NotificationItem[] = confirmedAttendees.map((att) => ({
      id: `notif-${Date.now()}-${att.id}`,
      type: 'event_cancelled',
      recipientEmail: att.attendeeEmail,
      recipientName: att.attendeeName,
      eventId: target.id,
      eventTitle: target.title,
      subject: `Notice: Event Cancelled — ${target.title}`,
      body: `Hello ${att.attendeeName}, the organizer has cancelled ${target.title}. ${reason ? `Reason: ${reason}` : 'We apologize for any inconvenience.'}`,
      sentAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [...newNotifications, ...prev]);
    return { success: true };
  };

  const submitRSVP = (
    eventId: string,
    name: string,
    email: string
  ): { success: boolean; message: string; record?: RSVPRecord; code?: string } => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      return { success: false, message: 'Event not found.' };
    }

    if (targetEvent.status === 'cancelled') {
      return { success: false, message: 'This event has been cancelled by the organizer and cannot accept RSVPs.' };
    }

    if (targetEvent.status === 'draft') {
      return { success: false, message: 'This event is currently an unpublished draft.' };
    }

    // Step 11: Deduplication rule: Check if this email already has a confirmed RSVP for this event
    const existingRSVP = rsvps.find(
      (r) => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingRSVP && existingRSVP.status === 'confirmed') {
      return {
        success: true,
        message: 'You already have a confirmed RSVP for this event!',
        record: existingRSVP,
        code: existingRSVP.confirmationCode,
      };
    }

    // Step 13: Check capacity limit
    const currentConfirmed = getConfirmedCount(eventId);
    if (currentConfirmed >= targetEvent.capacity) {
      // Ensure event status is marked 'full'
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'full' } : e))
      );
      return {
        success: false,
        message: 'This event is currently at full capacity. No remaining spots are available.',
      };
    }

    // Generate unique confirmation reference (e.g. GTH-7419-AB)
    const codeSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'XX';
    const confirmationCode = `GTH-${Math.floor(1000 + Math.random() * 9000)}-${initials}${codeSuffix.slice(0, 1)}`;

    let newRecord: RSVPRecord;

    if (existingRSVP && existingRSVP.status === 'cancelled') {
      // Re-activate previously cancelled record
      newRecord = {
        ...existingRSVP,
        attendeeName: name.trim(),
        status: 'confirmed',
        confirmationCode,
        registeredAt: new Date().toISOString(),
        cancelledAt: undefined,
      };
      setRsvps((prev) => prev.map((r) => (r.id === existingRSVP.id ? newRecord : r)));
    } else {
      newRecord = {
        id: `rsvp-${Date.now()}`,
        eventId,
        attendeeName: name.trim(),
        attendeeEmail: email.trim().toLowerCase(),
        status: 'confirmed',
        confirmationCode,
        registeredAt: new Date().toISOString(),
      };
      setRsvps((prev) => [newRecord, ...prev]);
    }

    // Check if new confirmed count reaches capacity
    const updatedCount = currentConfirmed + 1;
    if (updatedCount >= targetEvent.capacity) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'full' } : e))
      );
    }

    // Dispatch simulated confirmation notification email
    const cancellationLink = `https://gather.community/cancel?ref=${confirmationCode}`;
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'rsvp_confirmation',
      recipientEmail: email.trim().toLowerCase(),
      recipientName: name.trim(),
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      subject: `RSVP Confirmed: ${targetEvent.title}`,
      body: `Hello ${name}, your registration is confirmed! Confirmation code: ${confirmationCode}. Location: ${targetEvent.location}. Date: ${new Date(targetEvent.startDateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`,
      sentAt: new Date().toISOString(),
      confirmationCode,
      cancellationLink,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setWorkflowStep(9);

    return {
      success: true,
      message: 'Your RSVP is confirmed! We have dispatched a confirmation receipt.',
      record: newRecord,
      code: confirmationCode,
    };
  };

  const cancelRSVP = (rsvpId: string): { success: boolean; message: string } => {
    const target = rsvps.find((r) => r.id === rsvpId);
    if (!target) return { success: false, message: 'RSVP record not found.' };

    const targetEvent = events.find((e) => e.id === target.eventId);

    setRsvps((prev) =>
      prev.map((r) =>
        r.id === rsvpId
          ? {
              ...r,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
            }
          : r
      )
    );

    // If event was full, freeing up a spot reopens it to published status!
    if (targetEvent && targetEvent.status === 'full') {
      setEvents((prev) =>
        prev.map((e) => (e.id === targetEvent.id ? { ...e, status: 'published' } : e))
      );
    }

    // Dispatch cancellation notification
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'rsvp_cancellation',
      recipientEmail: target.attendeeEmail,
      recipientName: target.attendeeName,
      eventId: target.eventId,
      eventTitle: targetEvent ? targetEvent.title : 'Event',
      subject: `RSVP Cancelled: ${targetEvent ? targetEvent.title : 'Event'}`,
      body: `Hi ${target.attendeeName}, your registration (${target.confirmationCode}) has been cancelled. If your plans change again, you are welcome to RSVP while capacity remains.`,
      sentAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);

    return {
      success: true,
      message: 'Your RSVP has been cancelled. Your spot has been returned to the event capacity pool.',
    };
  };

  const resetDemoData = () => {
    setEvents(INITIAL_EVENTS);
    setRsvps(INITIAL_RSVPS);
    setCurrentUser(INITIAL_USERS[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedEventId('evt-design-systems');
    setCurrentView('discover');
    setWorkflowStep(1);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.RSVPS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        events,
        rsvps,
        currentUser,
        notifications,
        currentView,
        selectedEventId,
        showCreateEventModal,
        editingEvent,
        attendeeModalEventId,
        notificationDrawerOpen,
        workflowStep,
        availableUsers: INITIAL_USERS,
        setCurrentView,
        setSelectedEventId,
        openEventDetail,
        setShowCreateEventModal,
        setEditingEvent,
        setAttendeeModalEventId,
        setNotificationDrawerOpen,
        switchUser,
        setWorkflowStep,
        createEvent,
        updateEvent,
        publishEvent,
        cancelEvent,
        submitRSVP,
        cancelRSVP,
        getEventById,
        getConfirmedCount,
        getEventRSVPs,
        getUserRSVPForEvent,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
