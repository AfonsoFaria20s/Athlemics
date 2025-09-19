// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/home" />;
};

export default PrivateRoute;
