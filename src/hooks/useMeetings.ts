import { useEffect, useState } from "react";

export interface HubspotMeeting {
    id: string;
    properties: {
        hs_meeting_title: string;
        hs_meeting_start_time: string;
        hs_meeting_end_time: string;
        hs_meeting_location: string;
        hs_internal_meeting_notes: string;
    };
}

export function useMeetings(
    ownerId: string,
    startTime: number,
    endTime: number,
) {
    const [meetings, setMeetings] = useState<HubspotMeeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ownerId) return;

        setLoading(true);

        fetch("http://localhost:3000/api/meetings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ownerId, startTime, endTime }),
        })
            .then((res) => res.json())
            .then((data) => {
                setMeetings(data.results || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("❌ Meeting fetch failed", err);
                setLoading(false);
            });
    }, [ownerId, startTime, endTime]);

    return { meetings, loading };
}
