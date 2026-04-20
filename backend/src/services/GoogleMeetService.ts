import { google, calendar_v3 } from 'googleapis';
import configs from '../config/configs.js';

type MeetingAttendee = {
    email: string;
    name?: string;
};

export class GoogleMeetService {
    private static oauth2Client = new google.auth.OAuth2(
        configs.GOOGLE_MEET_CLIENT_ID,
        configs.GOOGLE_MEET_CLIENT_SECRET,
        configs.GOOGLE_MEET_REDIRECT_URI
    );

    static {
        if (configs.GOOGLE_MEET_REFRESH_TOKEN) {
            this.oauth2Client.setCredentials({
                refresh_token: configs.GOOGLE_MEET_REFRESH_TOKEN
            });
        }
    }

    static async createMeeting(
        summary: string, 
        description: string, 
        startTime: Date, 
        durationMinutes: number,
        attendees: MeetingAttendee[] = []
    ): Promise<string> {
        if (!configs.GOOGLE_MEET_REFRESH_TOKEN) {
            console.error('Google Meet Refresh Token is not configured. Returning fallback link.');
            return 'https://meet.google.com/fallback-link'; // Fallback for testing mode without valid token
        }

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const uniqueAttendees = Array.from(
            new Map(
                attendees
                    .filter(attendee => !!attendee?.email)
                    .map(attendee => [attendee.email.trim().toLowerCase(), attendee])
            ).values()
        );

        const event: calendar_v3.Schema$Event = {
            summary,
            description,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC',
            },
            attendees: uniqueAttendees.map(attendee => ({
                email: attendee.email,
                displayName: attendee.name ?? null,
            })),
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet',
                    },
                },
            },
        };

        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                conferenceDataVersion: 1, // Crucial for generating Meet links
                sendUpdates: 'all', // Send emails to attendees
            });

            const meetLink = response.data.hangoutLink;
            if (!meetLink) {
                throw new Error("Failed to generate Google Meet link. Make sure conference data was requested.");
            }
            return meetLink;
        } catch (error: any) {
            console.error('Error creating Google Meet event:', error);
            throw new Error('Failed to schedule session on Google Calendar.');
        }
    }
}
