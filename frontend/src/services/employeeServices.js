const url = 'http://localhost:8080';

const loadEmployees = async (token, searchTerm = '') => {
  try {
    let endpoint = `${url}/employees`;
    if (searchTerm) {
      endpoint += `?name=${encodeURIComponent(searchTerm)}`;
    }

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Security/Network error: ' + res.status);
    }

    return await res.json();
  } catch (err) {
    console.error('load employees error:', err);
    return { success: false, message: err.message };
  }
};

const addEmployee = async (token, formData) => {
  try {
    const res = await fetch(`${url}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error('Failed to add employee');
    }

    return await res.json();
  } catch (err) {
    console.error('add employee error:', err);
    return { success: false, message: err.message };
  }
};

const updateEmployee = async (token, employeeId, formData) => {
  try {
    const res = await fetch(`${url}/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error('Failed to update employee');
    }

    return await res.json();
  } catch (err) {
    console.error('update employee error:', err);
    return { success: false, message: err.message };
  }
};

const deleteEmployee = async (token, employeeId) => {
  try {
    const res = await fetch(`${url}/employees/${employeeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to delete employee');
    }

    return await res.json();
  } catch (err) {
    console.error('delete employee error:', err);
    return { success: false, message: err.message };
  }
};

export { loadEmployees, addEmployee, updateEmployee, deleteEmployee };