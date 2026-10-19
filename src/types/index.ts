export type EventFormat = 'in-person' | 'online';

export type EventStatus = 'draft' | 'published' | 'full' | 'cancelled' | 'completed';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  format: EventFormat;
  location: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  timeZone: string;      // e.g. 'America/Los_Angeles'
  capacity: number;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  coverImage?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVPRecord {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: 'confirmed' | 'cancelled';
  confirmationCode: string; // e.g. 'GTH-8492-7K'
  registeredAt: string;
  cancelledAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'attendee';
  bio?: string;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  type: 'rsvp_confirmation' | 'rsvp_cancellation' | 'event_cancelled' | 'event_updated';
  recipientEmail: string;
  recipientName: string;
  eventId: string;
  eventTitle: string;
  subject: string;
  body: string;
  sentAt: string;
  confirmationCode?: string;
  cancellationLink?: string;
}
