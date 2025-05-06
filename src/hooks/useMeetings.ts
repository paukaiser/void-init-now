
import { useEffect, useState } from "react";
import { Meeting } from "../components/MeetingCard";

export function useMeetings(
    ownerId: string,
    startTime: number,
    endTime: number,
) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
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
