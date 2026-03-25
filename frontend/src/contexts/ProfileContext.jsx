import { createContext, useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';

// Create the context object
export const ProfileContext = createContext();

// Define the provider component
export const ProfileProvider = ({ children }) => {
  // Store user info in state
  const [ user, setUser ] = useState();
  const [ token, setToken ] = useState(null);

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
  };

  // On initial load, check if there's a token and decode it
  // Persistent login across page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      const decoded = jwtDecode(storedToken); // Decode token on page refresh
      setUser({ id: decoded.id, username: decoded.username }); // Restore user context state
      setToken(storedToken); // Restore token in context state
    }
  }, []);

  // Provide context value to children
  const value = { user, token, login, logout };

  return (
    <ProfileContext.Provider value={ value }>
      { children }  {/* Render all children inside this provider */}
    </ProfileContext.Provider>
  );
};