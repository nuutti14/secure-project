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
  const { user, logout, isInitialized } = useContext(ProfileContext);
  const navigate = useNavigate();
  const { token } = useContext(ProfileContext);
  const [open, setOpen] = React.useState(false);
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

  // Check authentication on initialization
  useEffect(() => {
    if (isInitialized && !token) {
      navigate('/');
    }
  }, [isInitialized, token, navigate]);

  // Handler for logout button
  const handleLogout = () => {
    const confirmation = confirm('Are you sure you wanna logout?');
    if (confirmation) {
      logout(); // Remove token from localStorage
      navigate('/'); // Redirect to home page (login screen)
    }
  };

  
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onUpdate = async (value) => {
    const oldPw = value.oldPassword;
    const newPw = value.newPassword;
      try {
      const res = await fetch(`http://localhost:8080/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await res.json();
      toast.success(data.message || 'Password changed successfully');
      reset();
      handleClose();
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.message || 'An error occurred');
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
              {...register('oldPassword', 
                {required: "Old password is required" })}
              error={!!errors.newPassword}
              helperText={errors.oldPassword?.message}
            />
            <TextField
              label="New password"
              type="password"
              {...register('newPassword', { 
                ...passwordValidation(false),
                validate: (value) =>
                  value !== watch("oldPassword") || "New password must be different"   
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <TextField
              label="Confirm New password"
              type="password"
              {...register('confirmNewPassword', {
                required: "Confirmation is required",
                validate: (value) =>
                  value === watch("newPassword") || "Passwords do not match"
              })}
              error={!!errors.confirmNewPassword}
              helperText={errors.confirmNewPassword?.message}
            />
          </Stack>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={
                errors.newPassword ||
                errors.confirmNewPassword ||
                errors.oldPassword
              }
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