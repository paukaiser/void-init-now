import { useEffect, useState } from "react";

// 🟢 Flat shape matches your backend response
export interface Meeting {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    address?: string;
    companyName?: string;
    status?: string;
    type?: string;
    date?: string;
    dealId?: string | number; // (number in backend, but sometimes string in FE)
    companyId?: string | number;
    contactId?: string | number;
    // add other fields as needed
}

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
