const url = 'http://localhost:8080';

// Function to handle user registration
const registerUser = async (username, password) => {

  // error handling
  try {
    const res = await fetch(`${url}/register`, {
      method: 'POST', // HTTP POST request
      headers: { 'Content-Type': 'application/json' }, // Sending JSON
      body: JSON.stringify({ username, password }) // Payload
    });

    // Check if request was successful
    if (!res.ok) {
      console.error('Registration failed');
      return res.json(); // Still return the error message
    }

    return res.json(); // Return server response (success, token, etc.)
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Network error' };
  }

};

// Function to handle user login
const loginUser = async (username, password) => {
  // error handling
  try {
    console.log('Attempting login with:', username);
    const res = await fetch(`${url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('Login response status:', res.status);
    
    if (!res.ok) {
      console.error('Login failed');
      return res.json(); // return the error message
    }

    return res.json(); // Server sends back token if login successful
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Network error' };
  }   
};

// Export both functions so we can use them elsewhere
export { registerUser, loginUser };