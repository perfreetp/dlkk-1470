import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ApplicationList from "@/pages/ApplicationList";
import ApplicationDetail from "@/pages/ApplicationDetail";
import ApplicationWizard from "@/pages/ApplicationWizard";
import ApplicationPreview from "@/pages/ApplicationPreview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applications" element={<ApplicationList />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="applications/:id/edit" element={<ApplicationWizard />} />
          <Route path="applications/:id/preview" element={<ApplicationPreview />} />
        </Route>
      </Routes>
    </Router>
  );
}
