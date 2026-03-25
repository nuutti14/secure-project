export const passwordValidation = (isLoginMode) => ({
    required: 'Password is required',
    pattern: isLoginMode ? undefined : {
        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)\S{12,}$/,
        message: "At least 1 uppercase, 1 lowercase, 1 digit and lenght of 12 required."
    }
});

export const usernameValidation = (isLoginMode) => ({
    required: 'Username is required',
    minLength: isLoginMode ? undefined : { value: 4, message: 'Minimum 4 characters' },
});

export const departmentValidation = () => ({
    required: 'Department is required',
    minLength: {
        value: 3,
        message: 'Department must be at least 3 characters'
    },
    pattern: {
        value: /^[A-Za-z0-9\s]+$/,
        message: "Department can have only letters or numbers."
    }
});

export const roleValidation = () => ({
    required: 'Role is required',
    minLength: {
        value: 3,
        message: 'Role must be at least 3 characters'
    },
    pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Role can have only letters."
    }
});

export const nameValidation = () => ({
    required: 'Name is required',
    minLength: {
        value: 4,
        message: 'Name must be at least 4 characters'
    },
    pattern: {
        value: /^[A-Za-z]+ [A-Za-z]+$/,
        message: "Name must be Firstname Lastname"
    }
});