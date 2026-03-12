import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { registerUser, loginUser } from '../services/authService.js';


export default function Main() {
  // Access the login function from context
  const { login } = useContext(ProfileContext);

  // Hook from React Router to navigate pages
  const navigate = useNavigate();

  // State for form input
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');

  // State to store server response or error
  const [ data, setData ] = useState('');
  const [ err, setErr ] = useState(null);

  // State to toggle between login and signup/register mode
  const [ isLoginMode, setLoginMode ] = useState(true);

  // Texts that change depending on login/signup mode
  const submitBtnText = isLoginMode ? 'Login' : 'Sign up';
  const toggleBtnText = isLoginMode ? 'Sign up' : 'Login';
  const modeText = isLoginMode ? 'No account yet?' : 'Already have an account?';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Decide which function to call based on mode
      const calledFunction = isLoginMode ? loginUser : registerUser;
      const result = await calledFunction(username, password);

      console.log('Result from server:', result);
      
      // Store server response
      setData(result);

      // If login/signup was successful
      if (result.token) {
        login(result.token); // Save token in context + localStorage
        navigate('/employees'); // Redirect to employee directory
      } else {
        console.log('No token in result');
      }
    } catch (err) {
      console.log(err);
      setErr(err);
    }
  };

  // Toggle between login and signup modes
  const handleSignUpText = () => {
    setLoginMode(prev => !prev);
  };

  // Handle input updates
  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  return (
    <>
      {/* Display server messages */}
      <div className={data.success ? 'status ok-status' : 'status error-status'}>
        {data.message}
      </div>

      {/* Our reusable form component */}
      <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          onChange={handleUsernameInput} 
          value={username}
          type='text'
          placeholder='Username' />
        <input
          onChange={handlePasswordInput} 
          value={password}
          type='password'
          placeholder='Password' />
      </div>
      <button className="btn login-btn">
        {submitBtnText}
      </button>
    </form>

      {/* Toggle login/signup button */}
      <div className="signup-wrapper">
        <p>{modeText}</p>
        <button onClick={handleSignUpText} className="btn login-btn signup-btn">
          {toggleBtnText}
        </button>
      </div>
    </>
  );
}
