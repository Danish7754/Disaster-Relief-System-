import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));

const CitizenLayout = lazy(() => import("./Layouts/CitizenLayout"));
const NGOLayout = lazy(() => import("./Layouts/NGOLayout"));
const GovtLayout = lazy(() => import("./Layouts/GovtLayout"));

const CitizenDashboard = lazy(() => import("./pages/User/CitizenDashboard"));
const ReportIncident = lazy(() => import("./pages/User/ReportIncident"));
const MyReports = lazy(() => import("./pages/User/MyReports"));
const Profile = lazy(() => import("./pages/User/Profile"));
const ReportDetails = lazy(() => import("./pages/User/ReportDetails.jsx"));
const EditReport = lazy(() => import("./pages/User/EditReport.jsx"));

const NgoDashboard = lazy(() => import("./pages/NGO/NgoDashboard"));
const ReportNgo = lazy(() => import("./pages/NGO/ReportNgo"));
const NgoProfile = lazy(() => import("./pages/NGO/NgoProfile"));

const GovtOverview = lazy(() => import("./pages/Govt/Overview.jsx"));
const GovtReports = lazy(() => import("./pages/Govt/Reports.jsx"));
const GovtNgos = lazy(() => import("./pages/Govt/Ngos.jsx"));
const GovtAnalytics = lazy(() => import("./pages/Govt/Analytics.jsx"));
const GovtAssignments = lazy(() => import("./pages/Govt/Assignments.jsx"));

const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));

const RouteLoader = () => (
  <div className="flex min-h-[30vh] items-center justify-center text-sm font-medium text-slate-600">
    Loading...
  </div>
);

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
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

        <Route
          path="/reports"
          element={
            <ProtectedRoute role={["government", "govt"]}>
              <GovtLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GovtReports />} />
          <Route path=":severity" element={<GovtReports />} />
        </Route>

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;


