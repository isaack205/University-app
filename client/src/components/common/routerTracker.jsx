// Imports
import { useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/contexts/authContext";

// Track user's current path
export function PathTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only meaningful routes
    const ignore = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
    if (!ignore.includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  return null;
}

// Redirects to last visited path if token still valid
export function StartupRedirect() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const rawLast = localStorage.getItem('lastPath') || '/home';
    const lastPath = rawLast === "/" ? "/home" : rawLast;

    // Token missing, go to login
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Check expiry (exp is in seconds)
      if (decoded.exp * 1000 < Date.now()) {
        // If expired
        localStorage.removeItem('userToken');
        localStorage.removeItem('lastPath');
        navigate('/login', { replace: true });
        return;
      }

    } catch (error) {
      // Invalid token format
      localStorage.removeItem('userToken');
      navigate('/login', { replace: true });
      return;
    }

    if (authLoading) return;

    // Go to last visited route if valid token
    navigate(lastPath, { replace: true });

  }, [authLoading, navigate]);

  return null;
}
