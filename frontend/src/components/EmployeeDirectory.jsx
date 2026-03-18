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

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(ProfileContext);
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
    if (!token) {
      navigate('/');
      return;
    }

    loadEmployees();
  }, [token, navigate]);

  const handleLogout = () => {
    const confirmation = confirm('Are you sure you wanna logout?');
    if (confirmation) {
      logout();
      navigate('/');
    }
  };

  const onAdd = async (formData) => {
    console.log(formData);
    try {
      const res = await fetch('http://localhost:8080/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        handleClose();
        throw new Error('Failed to add');
      }
      await loadEmployees();
      reset();
      handleClose();
    } catch (err) {
      console.error('add employee error', err);
      setError(err.message);
    }
  };

  const onUpdate = async (formData) => {
    try {
      const res = await fetch(`http://localhost:8080/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update');
      await loadEmployees();
      reset();
      handleClose();
    } catch (err) {
      console.error('update employee error', err);
      setError(err.message);
    }
  };

  const onDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
        const res = await fetch(`http://localhost:8080/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
    }

    await loadEmployees();

    } catch (err) {
        console.error('delete employee error', err);
        setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className='employee-page'>
      
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
                <form onSubmit={handleFormSubmit(editingEmployee ? onUpdate : onAdd)}>
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
                            value: 3,
                            message: 'Role must be at least 3 characters'
                        },
                        pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Role can have only letters."
                        }
                       })}
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    />
                    <TextField
                      label="Department"
                      fullWidth
                      {...register('department', { required: 'Department is required',
                        minLength: {
                            value: 3,
                            message: 'Department must be at least 3 characters'
                        },
                        pattern: {
                            value: /^[A-Za-z0-9\s]+$/,
                            message: "Department can have only letters or numbers."
                        }
                       })}
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
                <button onClick={() => onDelete(emp.id)} className='btn update-delete-btn'>
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

