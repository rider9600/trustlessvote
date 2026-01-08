import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import NomineesPage from "./pages/Nominees";
import VotePage from "./pages/Vote";
import ResultsPage from "./pages/Results";
import AdminPage from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import ElectionDetails from "./pages/ElectionDetails";
import DebugStorage from "./pages/DebugStorage";
import ProcessPage from "./pages/Process";
import LoginPage from "./pages/Login";
import VoterDashboard from "./pages/VoterDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/voter" element={<VoterDashboard />} />
          <Route path="/nominees" element={<NomineesPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-election" element={<CreateElection />} />
          <Route path="/admin/election/:electionId" element={<ElectionDetails />} />
          <Route path="/admin/debug" element={<DebugStorage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
