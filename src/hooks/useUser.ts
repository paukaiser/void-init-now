
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface HubspotUser {
    name: string;
    email: string;
    user_id: string;
    hubspot_connected: boolean;
}

export function useUser() {
    const [user, setUser] = useState<HubspotUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setLoading(true);
                if (session?.user) {
                    await updateUserState(session.user);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        // Check for existing session
        const initializeUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await updateUserState(session.user);
            }
            setLoading(false);
        };

        initializeUser();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const updateUserState = async (supabaseUser: User) => {
        try {
            // Check if user has HubSpot token
            const { data: tokenData, error: tokenError } = await supabase
                .from('user_hubspot_tokens')
                .select('*')
                .eq('user_id', supabaseUser.id)
                .single();

            setUser({
                name: supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                user_id: supabaseUser.id,
                hubspot_connected: !!tokenData && !tokenError
            });
        } catch (error) {
            console.error("Error getting user data:", error);
            setUser({
                name: supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                user_id: supabaseUser.id,
                hubspot_connected: false
            });
        }
    };

    return { user, loading };
}
