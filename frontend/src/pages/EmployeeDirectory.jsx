import React, { useState, useEffect, useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext.jsx';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(ProfileContext);
  const { user, logout } = useContext(ProfileContext);
  const [search, setSearch] = useState('')
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(); // clear form values when closing modal
  };

  // react-hook-form for employee form
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const loadEmployees = (searchTerm = '') => {
    setLoading(true);
    let url = 'http://localhost:8080/employees';
    if (searchTerm) {
      url += `?name=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Security/Network error: ' + res.status);
        return res.json();
      })
      .then((res) => {
        setEmployees(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate('/');
      return;
    }

    loadEmployees();
  }, [token, navigate]);

  const handleLogout = () => {
    const confirmation = confirm('Are you sure you wanna logout?');
    if (confirmation) {
      logout(); // Remove token from localStorage
      navigate('/'); // Redirect to home page (login screen)
    }
  };

  // on-submit handler for new employee form
  const onAdd = async (formData) => {
    try {
      const res = await fetch('http://localhost:8080/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to add');
      await loadEmployees();
      reset();
      handleClose();
    } catch (err) {
      console.error('add employee error', err);
      setError(err.message);
    }
  };
  

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className='employee-page'>
      
      <h1>Secure Employee Directory</h1>
      
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
          onClick={() => loadEmployees(search)}
        >
          Search
        </button>
        </div>
        <Button className='add-employee' onClick={handleOpen}>Add Employee</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box className="employee-modal">
                <Typography variant="h6" color='black' mb={2}>
                    Add Employee
                </Typography>
                <form onSubmit={handleFormSubmit(onAdd)}>
                  <Stack spacing={2}>
                    <TextField
                      label="Employee Name"
                      fullWidth
                      {...register('name', { required: 'Name is required',
                        minLength: {
                            value: 4,
                            message: 'Name must be at least 4 characters'
                        },
                        pattern: {
                            value: /^[A-Za-z]+ [A-Za-z]+$/,
                            message: "Name must be Firstname Lastname"
                        }
                       })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />

                    <TextField
                      label="Role"
                      fullWidth
                      {...register('role', { required: 'Role is required',
                        minLength: {
                            value: 4,
                            message: 'Name must be at least 4 characters'
                        }
                       })}
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    />

                    <TextField
                      label="Department"
                      fullWidth
                      {...register('department', { required: 'Department is required' })}
                      error={!!errors.department}
                      helperText={errors.department?.message}
                    />
                  </Stack>
                  <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={handleClose} type="button">
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit
                    </Button>
                  </Box>
                </form>
                </Box>
            </Modal>
       
      </section>
      <div className="table-section">
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
       </div>
       <button onClick={handleLogout} className="btn logout-btn">Logout</button>
    </div>
        );
}

export default EmployeeDirectory;
