import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();

  // 1️⃣ Agar user login hi nahi hai
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Agar role match nahi karta
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }
   

  // 3️⃣ Sab sahi hai → page render karo
  return children;
}

export default ProtectedRoute;