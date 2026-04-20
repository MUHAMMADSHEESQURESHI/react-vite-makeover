import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Home from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import AICenter from "./pages/AICenter";
import Auth from "./pages/Auth";
import CreateRequest from "./pages/CreateRequest";
import Leaderboard from "./pages/Leaderboard";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import RequestDetail from "./pages/RequestDetail";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/ai" element={<AICenter />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
