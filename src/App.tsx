
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import AddMeeting from "./pages/AddMeeting";
import MeetingActions from "./pages/MeetingActions";
import MeetingOutcome from "./pages/MeetingOutcome";
import PositiveOutcome from "./pages/PositiveOutcome";
import NegativeOutcome from "./pages/NegativeOutcome";
import FollowUpOutcome from "./pages/FollowUpOutcome";
import MeetingCanceled from "./pages/MeetingCanceled";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import GuestLayout from "./components/GuestLayout";
import Inbox from "./pages/Inbox";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Guest routes */}
            <Route element={<GuestLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<AuthLayout />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/meetings" element={<Dashboard />} />
              </Route>
              
              <Route path="/add-meeting" element={<AddMeeting />} />
              <Route path="/meeting/:id" element={<MeetingActions />} />
              <Route path="/meeting/:id/outcome" element={<MeetingOutcome />} />
              <Route path="/meeting/:id/positive" element={<PositiveOutcome />} />
              <Route path="/meeting/:id/negative" element={<NegativeOutcome />} />
              <Route path="/meeting/:id/follow-up" element={<FollowUpOutcome />} />
              <Route path="/meeting-canceled" element={<MeetingCanceled />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
