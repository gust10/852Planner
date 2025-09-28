import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Survey from "./pages/Survey";
import WeatherInfo from "./pages/WeatherInfo";
import Itinerary from "./pages/Itinerary";
import Dashboard from "./pages/Dashboard";
import SharedItinerary from "./pages/SharedItinerary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/weather-info" element={<WeatherInfo />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shared/:id" element={<SharedItinerary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
