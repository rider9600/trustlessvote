import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import SignUpPage from "./pages/SignUp";
import VoterDashboard from "./pages/VoterDashboard";
import VoterProfile from "./pages/VoterProfile";
import NotFound from "./pages/NotFound";
import VoterElection from "./pages/VoterElection";

console.log('[App.tsx] Initializing QueryClient');
const queryClient = new QueryClient();

const App = () => {
  console.log('[App.tsx] Rendering <App /> component');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/voter" element={<VoterDashboard />} />
            <Route path="/voter/profile" element={<VoterProfile />} />
            <Route path="/voter/election/:electionId" element={<VoterElection />} />
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
};

export default App;
