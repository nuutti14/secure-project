import React, { useState, useEffect, useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { departmentValidation, nameValidation, roleValidation } from '../services/validationRules.js';
import { loadEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/employeeServices.js';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, isInitialized } = useContext(ProfileContext);
  const { user, logout } = useContext(ProfileContext);
  const [search, setSearch] = useState('')
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingEmployee(null);
    reset();
  };

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm();


  // Fetch employees on component mount or when search changes
  useEffect(() => {
    if (!isInitialized) {
      return; 
    }
    if (!token) {
      navigate('/');
      return;
    }
    fetchEmployees(search);
  }, [token, isInitialized, navigate]);

  // Fetch employees with proper state management
  const fetchEmployees = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    const result = await loadEmployees(token, searchTerm);
    if (result.success === false) {
      setError(result.message);
      setEmployees([]);
    } else {
      setEmployees(result);
    }
    setLoading(false);
  };

  // Handle adding a new employee
  const handleAddEmployee = async (formData) => {
    try {
      const result = await addEmployee(token, formData);
      if (result.success === false) {
        setError(result.message);
        return;
      }
      await fetchEmployees(search);
      reset();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    }
  };

  // Handle updating an employee
  const handleUpdateEmployee = async (formData) => {
    try {
      const result = await updateEmployee(token, editingEmployee.id, formData);
      if (result.success === false) {
        setError(result.message);
        return;
      }
      await fetchEmployees(search);
      reset();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to update employee');
    }
  };

  // Handle deleting an employee
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const result = await deleteEmployee(token, employeeId);
      if (result.success === false) {
        setError(result.message);
        return;
      }
      await fetchEmployees(search);
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchEmployees(search);
  };

  const handleLogout = () => {
    const confirmation = confirm('Are you sure you wanna logout?');
    if (confirmation) {
      logout();
      navigate('/');
    }
  };


  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className='employee-page'>
      <div className='profile-btn-container'>
      <button className='btn login-btn' onClick={()=>navigate('/profile')}>{user.user || 'Guest'}</button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
      <section className="top-controls">
        <div className='search-group'>
        <input
          className='search-input'
          type="text"
          placeholder="Search employees..."
          style={{ padding: '8px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className='btn search-btn'
          onClick={handleSearch}
        >
          Search
        </button>
        <button className='btn add-btn' onClick={handleOpen}>Add Employee</button>
        </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box className="employee-modal">
                <Typography variant="h6" color='black' mb={2}>
                    {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </Typography>
                <form onSubmit={handleFormSubmit(editingEmployee ? handleUpdateEmployee : handleAddEmployee)}>
                  <Stack spacing={2}>
                    <TextField
                      label="Employee Name"
                      fullWidth
                      {...register('name', nameValidation())}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                    <TextField
                      label="Role"
                      fullWidth
                      {...register('role', roleValidation())}
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    />
                    <TextField
                      label="Department"
                      fullWidth
                      {...register('department', departmentValidation())}
                      error={!!errors.department}
                      helperText={errors.department?.message}
                    />
                  </Stack>
                  <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={handleClose} type="button">
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEmployee ? 'Update' : 'Submit'}
                    </Button>
                  </Box>
                </form>
                </Box>
            </Modal>
       
      </section>
      <div className="table-section">
      <table border="1" cellPadding="10" className='employee-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody >
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.department}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => handleDeleteEmployee(emp.id)} className='btn update-delete-btn'>
                  Delete</button>
                <button className='btn update-delete-btn' onClick={() => {
                  setEditingEmployee(emp);
                  reset(emp);
                  handleOpen();
                }}>Update</button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
       </div>
       <button onClick={handleLogout} className="btn logout-btn">Logout</button>
    </div>
        );
}

