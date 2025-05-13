import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GroupContacts from "./pages/GroupContacts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Settings } from "./pages/Settings";
import Todos from "./pages/Todos";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { TagProvider } from "@/features/tags/context/TagContext";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <TagProvider>
            <Routes>
              <Route
                path="/auth"
                element={<Auth />}
              />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={<Index />}
                />
                <Route
                  path="/groups/:groupId"
                  element={<GroupContacts />}
                />
                <Route
                  path="/settings"
                  element={<Settings />}
                />
                <Route
                  path="/todos"
                  element={<Todos />}
                />
                {/* Add other protected routes here */}
              </Route>

              {/* Catch-all route */}
              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </TagProvider>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
