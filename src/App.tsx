
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddMeeting from "./pages/AddMeeting";
import MeetingActions from "./pages/MeetingActions";
import MeetingOutcome from "./pages/MeetingOutcome";
import PositiveOutcome from "./pages/PositiveOutcome";
import NegativeOutcome from "./pages/NegativeOutcome";
import FollowUpOutcome from "./pages/FollowUpOutcome";
import MeetingCanceled from "./pages/MeetingCanceled";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Inbox from "./pages/Inbox";
import LoginPage from "./pages/Login";
import OAuthCallbackPage from "./pages/OAuthCallback";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
            
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/meetings" element={<Dashboard />} />
            </Route>
            
            <Route path="/add-meeting" element={<AuthGuard><AddMeeting /></AuthGuard>} />
            <Route path="/meeting/:id" element={<AuthGuard><MeetingActions /></AuthGuard>} />
            <Route path="/meeting/:id/outcome" element={<AuthGuard><MeetingOutcome /></AuthGuard>} />
            <Route path="/meeting/:id/positive" element={<AuthGuard><PositiveOutcome /></AuthGuard>} />
            <Route path="/meeting/:id/negative" element={<AuthGuard><NegativeOutcome /></AuthGuard>} />
            <Route path="/meeting/:id/follow-up" element={<AuthGuard><FollowUpOutcome /></AuthGuard>} />
            <Route path="/meeting-canceled" element={<AuthGuard><MeetingCanceled /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
