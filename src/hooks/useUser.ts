import { useEffect, useState } from "react";

export interface HubspotUser {
    name: string;
    email: string;
    user_id: string;
}

export function useUser() {
    const [user, setUser] = useState<HubspotUser | null>(null);

    useEffect(() => {
        fetch("http://localhost:3000/api/me", { credentials: "include" })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data) {
                    setUser({
                        name: data.name,
                        email: data.email,
                        user_id: data.user_id,
                    });
                }
            })
            .catch(() => setUser(null));
    }, []);

    return user;
}
