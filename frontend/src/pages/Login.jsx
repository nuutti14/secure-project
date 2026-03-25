import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { registerUser, loginUser } from '../services/authService.js';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import { passwordValidation, usernameValidation } from '../services/validationRules.js';



export default function Main() {
  // Access the login function from context
  const { login } = useContext(ProfileContext);

  // Hook from React Router to navigate pages
  const navigate = useNavigate();

  // Validation form management (username/password)

  // State to store server response or error
  const [ data, setData ] = useState('');
  const [ err, setErr ] = useState(null);
  const captchaKey = import.meta.env.VITE_APP_CAPTCHA_SITE_KEY;
  // State to toggle between login and signup/register mode
  const [ isLoginMode, setLoginMode ] = useState(true);
  // State for CAPTCHA value
  const [ captcha, setCaptcha ] = useState('');

  // Texts that change depending on login/signup mode
  const submitBtnText = isLoginMode ? 'Login' : 'Sign up';
  const toggleBtnText = isLoginMode ? 'Sign up' : 'Login';
  const modeText = isLoginMode ? 'No account yet?' : 'Already have an account?';

  const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors },
      reset,
    } = useForm({
       mode: "onChange"
    });

  // reset form when switching mode so validation clears
  const switchMode = () => {
    setLoginMode(prev => !prev);
    reset();
    setData('');
  };

  const onCaptchaChange = (value) => {
    setCaptcha(value);
  };

  // called by react-hook-form with validated data
  const onSubmit = async ({ username, password }) => {
    console.log(captchaKey);
    if (!captcha) {
      toast.error('Please complete the CAPTCHA');
      return;
    }
    try {
      const calledFunction = isLoginMode ? loginUser : registerUser;
      const requestCaptcha = captcha;
      const result = await calledFunction(username, password, requestCaptcha);

      setData(result);

      if (result.token) {
        toast.success(isLoginMode ? 'Login successful' : 'Registration successful');
        login(result.token);
        reset();
        navigate('/employees');
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message || 'An error occurred');
      setErr(err);
    }
  };



  return (
    <>
      {/* form using react-hook-form */}
      <form className="login-form" onSubmit={handleFormSubmit(onSubmit)}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Username"
            {...register('username', usernameValidation(isLoginMode))}
          />
          {errors.username && <p className="error-status">{errors.username.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register('password',passwordValidation(isLoginMode))}
          />
          {errors.password && <p className="error-status">{errors.password.message}</p>}
          <div className="captcha-container">
            <ReCAPTCHA
              sitekey={captchaKey}
              onChange={onCaptchaChange}
            />
          </div>
          
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
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}
