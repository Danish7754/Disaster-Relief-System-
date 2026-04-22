import { useAuth } from "../../context/AuthContext";

function GovtDashboard() {
  const { logout } = useAuth();

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Government Dashboard</h1>

      <button
        onClick={logout}
        className="mt-5 bg-red-600 text-white px-4 py-2"
      >
        Logout
      </button>
    </div>
  );
}

export default GovtDashboard;
