const url = 'http://localhost:8080';

export const changePassword = async (token, oldPw, newPw) => {
  try {
    const res = await fetch(`${url}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    return await res.json();
  } catch (err) {
    console.error('change password error:', err);
    return { success: false, message: err.message };
  }
};