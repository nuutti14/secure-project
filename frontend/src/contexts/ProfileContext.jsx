import { createContext, useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';

// Create the context object
export const ProfileContext = createContext();

// Define the provider component
export const ProfileProvider = ({ children }) => {
  // Store user info in state
  const [ user, setUser ] = useState();
  const [ token, setToken ] = useState(null);
  const [ isInitialized, setIsInitialized ] = useState(false); // Track if token has been restored from localStorage

  // Function to log in a user
  const login = (token) => {
    localStorage.setItem('token', token); // Save token to localStorage
    const decoded = jwtDecode(token); // Decode JWT to get username
    setUser({id: decoded.id, username: decoded.username }); // Store username in context state
    setToken(token); // Store token in context state
  };

  // Function to log out a user
  const logout = () => {
    localStorage.removeItem('token'); // Clear token from localStorage
    setToken(null);
    setUser(null);
  };

  // On initial load, check if there's a token and decode it
  // Persistent login across page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken); // Decode token on page refresh
        setUser({ id: decoded.id, username: decoded.username }); // Restore user context state
        setToken(storedToken); // Restore token in context state
      } catch (err) {
        console.error('Failed to decode token:', err);
        localStorage.removeItem('token'); // Remove invalid token
      }
    }
    setIsInitialized(true); // Mark initialization as complete
  }, []);

  // Provide context value to children
  const value = { user, token, login, logout, isInitialized };

  return (
    <ProfileContext.Provider value={ value }>
      { children }  {/* Render all children inside this provider */}
    </ProfileContext.Provider>
  );
};