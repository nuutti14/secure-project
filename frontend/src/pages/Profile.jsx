import { ProfileContext } from "../contexts/ProfileContext.jsx";
import { useNavigate } from 'react-router';
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField'
import  { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { passwordValidation } from "../services/validationRules.js";
import { changePassword } from "../services/profileService.js";




export default function Profile() {
  const { user, logout, isInitialized, token } = useContext(ProfileContext); // Extract user info and logout function from context
  const navigate = useNavigate(); // Hook from React Router to navigate pages
  const [open, setOpen] = useState(false); //usestate for modal
  
  //Initialize the useform
  const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors, isValid },
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

  //Handle modal opening
  const handleOpen = () => setOpen(true);

  //Handle modal closing
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  //Handle password update
  const handlePasswordUpdate = async (value) => {
    const oldPw = value.oldPassword;
    const newPw = value.newPassword;
    const result = await changePassword(token, oldPw, newPw);
    if (result.success === false) {
      toast.error(result.message);
      return;
    }
    toast.success('Password changed successfully');
    await fetchProfile(); // refresh if needed
    handleClose();
  };


  return (
    <div className="profile-page">
      <button onClick={() => navigate('/employees')} className="btn back-btn">← Back</button>
      <h1 className="greeting">Hello, {user?.username || 'Guest'}!</h1>
      <button onClick={()=>handleOpen()} className="btn logout-btn">Edit Profile</button>
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
        <form onSubmit={handleFormSubmit(handlePasswordUpdate)}>
          <Stack spacing={2}>
            <TextField
              label="Old password"
              type="password"
              {...register('oldPassword', 
                {required: "Old password is required" })}
              error={!!errors.oldPassword}
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
              disabled={!isValid}
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