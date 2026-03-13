import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { registerUser, loginUser } from '../services/authService.js';
import { useForm } from 'react-hook-form';



export default function Main() {
  // Access the login function from context
  const { login } = useContext(ProfileContext);

  // Hook from React Router to navigate pages
  const navigate = useNavigate();

  // Validation form management (username/password)

  // State to store server response or error
  const [ data, setData ] = useState('');
  const [ err, setErr ] = useState(null);

  // State to toggle between login and signup/register mode
  const [ isLoginMode, setLoginMode ] = useState(true);

  // Texts that change depending on login/signup mode
  const submitBtnText = isLoginMode ? 'Login' : 'Sign up';
  const toggleBtnText = isLoginMode ? 'Sign up' : 'Login';
  const modeText = isLoginMode ? 'No account yet?' : 'Already have an account?';

  const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors },
      reset,
    } = useForm();

  // reset form when switching mode so validation clears
  const switchMode = () => {
    setLoginMode(prev => !prev);
    reset();
    setData('');
  };

  // called by react-hook-form with validated data
  const onSubmit = async ({ username, password }) => {
    try {
      const calledFunction = isLoginMode ? loginUser : registerUser;
      const result = await calledFunction(username, password);

      console.log('Result from server:', result);
      setData(result);

      if (result.token) {
        login(result.token);
        reset();
        navigate('/employees');
      } else {
        console.log('No token in result');
      }
    } catch (err) {
      console.log(err);
      setErr(err);
    }
  };



  return (
    <>
      {/* Display server messages */}
      <div className={data.success ? 'status ok-status' : 'status error-status'}>
        {data.message}
      </div>

      {/* form using react-hook-form */}
      <form className="login-form" onSubmit={handleFormSubmit(onSubmit)}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Username"
            {...register('username', {
              required: 'Username is required',
              minLength: isLoginMode ? undefined : { value: 4, message: 'Minimum 4 characters' },
            })}
          />
          {errors.username && <p className="error-status">{errors.username.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: isLoginMode ? undefined : { value: 8, message: 'Minimum 8 characters' },
            })}
          />
          {errors.password && <p className="error-status">{errors.password.message}</p>}
        </div>
        <button className="btn login-btn">
          {submitBtnText}
        </button>
      </form>

      {/* Toggle login/signup button */}
      <div className="signup-wrapper">
        <p>{modeText}</p>
        <button onClick={switchMode} className="btn login-btn signup-btn">
          {toggleBtnText}
        </button>
      </div>
    </>
  );
}
