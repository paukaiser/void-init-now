
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Meetings from "./pages/Meetings";
import AddMeeting from "./pages/AddMeeting";
import MeetingActions from "./pages/MeetingActions";
import MeetingOutcome from "./pages/MeetingOutcome";
import PositiveOutcome from "./pages/PositiveOutcome";
import NegativeOutcome from "./pages/NegativeOutcome";
import FollowUpOutcome from "./pages/FollowUpOutcome";
import MeetingCanceled from "./pages/MeetingCanceled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/:userSlug" element={<Index />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/add-meeting" element={<AddMeeting />} />
          <Route path="/meeting/:id" element={<MeetingActions />} />
          <Route path="/meeting/:id/outcome" element={<MeetingOutcome />} />
          <Route path="/meeting/:id/positive" element={<PositiveOutcome />} />
          <Route path="/meeting/:id/negative" element={<NegativeOutcome />} />
          <Route path="/meeting/:id/follow-up" element={<FollowUpOutcome />} />
          <Route path="/meeting-canceled" element={<MeetingCanceled />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
