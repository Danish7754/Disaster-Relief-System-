import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home.jsx";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CitizenLayout from "./Layouts/CitizenLayout";
import NGOLayout from "./Layouts/NGOLayout";
import GovtLayout from "./Layouts/GovtLayout";
import CitizenDashboard from "./pages/User/CitizenDashboard";
import ReportIncident from "./pages/User/ReportIncident";
import MyReports from "./pages/User/MyReports";
import Profile from "./pages/User/Profile";
import NgoDashboard from "./pages/NGO/NgoDashboard";
import ReportNgo from "./pages/NGO/ReportNgo";
import NgoProfile from "./pages/NGO/NgoProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ReportDetails from "./pages/User/ReportDetails.jsx";
import EditReport from "./pages/User/EditReport.jsx"; 
import GovtOverview from "./pages/Govt/Overview.jsx";
import GovtReports from "./pages/Govt/Reports.jsx";
import GovtNgos from "./pages/Govt/Ngos.jsx";
import GovtAnalytics from "./pages/Govt/Analytics.jsx";
import GovtAssignments from "./pages/Govt/Assignments.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/citizen"
        element={
          <ProtectedRoute role="citizen">
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CitizenDashboard />} />
        <Route path="report-incident" element={<ReportIncident />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="report/:id" element={<ReportDetails />} />
        <Route path="edit-report/:id" element={<EditReport />} />
        <Route path="profile" element={<Profile />} />
      </Route>


      <Route
        path="/ngo"
        element={
          <ProtectedRoute role="ngo">
            <NGOLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NgoDashboard />} />
        <Route path="profile" element={<NgoProfile />} />
        <Route path="reports" element={<ReportNgo />} />
      </Route>
      <Route
        path="/govt"
        element={
          <ProtectedRoute role={["government", "govt"]}>
            <GovtLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GovtOverview />} />
        <Route path="reports" element={<GovtReports />} />
        <Route path="ngos" element={<GovtNgos />} />
        <Route path="analytics" element={<GovtAnalytics />} />
        <Route path="assignments" element={<GovtAssignments />} />
      </Route>
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;


