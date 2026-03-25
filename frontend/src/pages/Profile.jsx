import { ProfileContext } from "../contexts/ProfileContext.jsx";
import { useNavigate } from 'react-router';
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField'
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { passwordValidation } from "../services/validationRules.js";




export default function Profile() {
 // Extract user info and logout function from context
  const { user, logout } = useContext(ProfileContext);
  const navigate = useNavigate();
  const { token } = useContext(ProfileContext);
  const [open, setOpen] = React.useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordValid, setOldPasswordValid] = useState(null);
  const [error, setError] = useState(null);
  

  const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors },
      watch,
      reset,
    } = useForm({
      mode: "onChange"
  });

  // Handler for logout button
  const handleLogout = () => {
    const confirmation = confirm('Are you sure you wanna logout?');
    if (confirmation) {
      logout(); // Remove token from localStorage
      navigate('/'); // Redirect to home page (login screen)
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (oldPassword.length > 0) verifyOldPassword(oldPassword);
    }, 500);

    return () => clearTimeout(timeout);
  }, [oldPassword]);

  
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setOldPassword('');
    setOldPasswordValid(null);
    reset();
  };

  const onUpdate = async ({ password, confirmPassword }) => {
    if (!oldPasswordValid) {
      toast.error('Please verify old password first');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword: password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await res.json();
      toast.success(data.message || 'Password changed successfully');
      setOldPassword('');
      setOldPasswordValid(null);
      reset();
      handleClose();
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.message || 'An error occurred');
    }
  };


  const verifyOldPassword = async (value) => {
    try {
      const res = await fetch(`http://localhost:8080/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword })
      });

      if (!res.ok) {
        throw new Error('Verification failed');
      }

      const data = await res.json();
      setOldPasswordValid(data.valid);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="profile-page">
      {/* Back button - top left */}
      <button onClick={() => navigate('/employees')} className="btn back-btn">← Back</button>

      {/* Greeting - center */}
      <h1 className="greeting">Hello, {user?.username || 'Guest'}!</h1>

      {/* Edit Profile button */}
      <button onClick={()=>handleOpen()} className="btn logout-btn">Edit Profile</button>

      {/* Logout button - bottom center */}
      <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
    <Box className="employee-modal">
        <Typography variant="h6" color='black' mb={2}>
            Change password
        </Typography>
        <form onSubmit={handleFormSubmit(onUpdate)}>
          <Stack spacing={2}>
            <TextField
              label="Old password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              error={oldPasswordValid === false}
              helperText={
                oldPasswordValid === false
                  ? "Old password incorrect"
                  : oldPasswordValid === true
                  ? "Password correct"
                  : ""
              }
            />
            <TextField
              label="New password"
              type="password"
              disabled={!oldPasswordValid}
              {...register('password', { 
                ...passwordValidation(false), 
                validate: (value) =>
                  value === oldPassword || "Cannot be same"
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              label="Confirm New password"
              type="password"
              disabled={!oldPasswordValid || !watch("password") || errors.password}
              {...register("confirmPassword", {
                validate: (value) =>
                  value === watch("password") || "Passwords do not match"
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Stack>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled = {errors.confirmPassword}
            >
              Change
            </Button>
          </Box>
        </form>
        </Box>
    </Modal>
    <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}