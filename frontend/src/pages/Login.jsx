import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { registerUser, loginUser } from '../services/authService.js';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import { passwordValidation, usernameValidation } from '../services/validationRules.js';



export default function Main() {
  const { login } = useContext(ProfileContext); // Access the login function from context
  const navigate = useNavigate(); // Hook from React Router to navigate pages
  const [ data, setData ] = useState(''); //Usesate to store data
  const [ isLoginMode, setLoginMode ] = useState(true); // State to toggle between login and signup/register mode
  const [ captcha, setCaptcha ] = useState(''); // State for CAPTCHA value
  // Texts that change depending on login/signup mode
  const submitBtnText = isLoginMode ? 'Login' : 'Sign up';
  const toggleBtnText = isLoginMode ? 'Sign up' : 'Login';
  const modeText = isLoginMode ? 'No account yet?' : 'Already have an account?';
  //Import captcha key from env
  const captchaKey = import.meta.env.VITE_APP_CAPTCHA_SITE_KEY;

  //Initialize the useForm
  const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors },
      reset,
      watch
    } = useForm({
       mode: "onChange"
    });

  // reset form when switching mode so validation clears
  const switchMode = () => {
    setLoginMode(prev => !prev);
    reset();
    setData('');
    setCaptcha('');
  };

  //set captcha
  const onCaptchaChange = (value) => {
    setCaptcha(value);
  };

  // called by react-hook-form with validated data
  const onSubmit = async ({ username, password }) => {
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
        setCaptcha('');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      setCaptcha('');
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
            {...register('password',
              passwordValidation(isLoginMode))}
          />
          {errors.password && <p className="error-status">{errors.password.message}</p>}
          {!isLoginMode && 
            <input
            type="password"
            placeholder="Password"
            {...register('confirmPassword',{
              required: "Confirmation is required",
              validate: (value) =>
                  value === watch("password") || "Passwords do not match"  
            })}
            />
          }
          {errors.confirmPassword && <p className="error-status">
            {errors.confirmPassword.message}</p>}
          
          {!captcha ? (
            <div className="captcha-container">
              <ReCAPTCHA
                sitekey={captchaKey}
                onChange={onCaptchaChange}
              />
            </div>
          ) : (
            <div className="captcha-container captcha-verified">
              <p className="success-status">✓ CAPTCHA verified</p>
            </div>
          )}
          
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
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}
