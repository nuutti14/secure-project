const url = 'http://localhost:8080';

const registerUser = async (username, password) => {

  try {
    const res = await fetch(`${url}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ username, password }) 
    });

    if (!res.ok) {
      console.error('Registration failed');
      return res.json();
    }

    return res.json();
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Network error' };
  }

};

const loginUser = async (username, password) => {
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
      return res.json();
    }

    return res.json();
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Network error' };
  }   
};

export { registerUser, loginUser };