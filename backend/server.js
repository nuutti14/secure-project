import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import verifyCaptcha from './recaptchaMiddleware.js';
import { addEmployee, updateEmployee, deleteEmployee, 
  findUser, addUser, getEmployees, updatePassword, findUserName } from './crud.js';

// Load environment variables from .env to keep secrets out of source code.
// This is a security best practice (no hard-coded keys in the repo).
configDotenv();

// Rate limiter to mitigate brute-force and DOS risk.
// Limits number of requests per IP, reducing attacker ability to test many credentials quickly.
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  limit: 100, // each IP max 100 requests per window (tunable)
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  // In production, use an external store (Redis/memcached) so limits persist across server instances.
});
// Secret key for signing JWT
const JWT_KEY = process.env.JWT_KEY;

// Initialize the Express app
const app = express();

// Middleware to handle CORS
app.use(cors({origin: 'http://localhost:5173'}));
// Parse incoming json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(['/login', '/register', '/employees'], limiter)

// Validate and sanitise fields on employee creation/update in addition to DB parameterization.
// Limits what users can send to the database and avoids injections via malformed input.
function regexCheck(name, department, role) {
  const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/; // first and last name only
  const depRegex = /^[A-Za-z0-9\s]+$/; // letters and numbers only
  const roleRegex = /^[A-Za-z\s]+$/; // letters and spaces only
  return nameRegex.test(name) && roleRegex.test(role) && depRegex.test(department);
}

// Middleware to protect API endpoints using JWT.
// Ensures only requests with valid token can access user/employee operations.
const loginMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Inexistent or invalid token' });
  }
  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded; // contains id + username
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
  // Verify JWT signature, expiration, and claims.
  // jwt.verify(token, JWT_KEY, (err, user) => {
  //   if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
  //   req.user = user;
  //   next();
  // });
};



// Register Route
// - Captcha protected to avoid bot registration.
// - Username duplication checked to prevent enumeration/existing user conflicts.
// - Password is hashed via bcrypt before database insert (never store plaintext).
app.post('/register', verifyCaptcha, async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await findUserName(username);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists!' });
    };

    const hashedPass = await bcryptjs.hash(password, 12);

    const newUser = await addUser({ username, password: hashedPass });

    res.status(201).json({ success: true, message: 'New user created!', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login Route
// - checks user existence and password hash; no plaintext password comparisons
// - generates short-lived JWT to avoid session hijack risk
app.post('/login', verifyCaptcha, async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await findUserName(username);
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const isPassValid = await bcryptjs.compare(password, existing.password);
    if (!isPassValid) {
      return res.status(404).json({ success: false, message: 'Invalid password' });
    }

    const payload = { 
      username: existing.username,
      id: existing.id 
     };
    const token = jwt.sign(payload, JWT_KEY, { expiresIn: '24h' });

    res.status(200).json({ token, success: true, message: 'Logged in successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// Protected Profile Route
// Requires verified JWT token from loginMiddleware.
// Demonstrates session context in API responses without revealing sensitive data.
app.get('/profile', loginMiddleware, (req, res) => {
  const username = req.user.username;
  res.json({ success: true, message: `Welcome, ${username}!` });
});


// list (or search) employees
// Protected by loginMiddleware, so only authenticated users can call this route.
// Query parameter is sanitized inside getEmployees for safe LIKE-style search.
app.get('/employees', loginMiddleware, async (req, res) => {
  try {
    const { name } = req.query;
    const employees = await getEmployees(name);
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// add a new employee
// Protected by login and request validation to prevent malformed input.
app.post('/employees', loginMiddleware, async (req, res) => {
  const { name, role, department } = req.body;
  if (!regexCheck(name, department, role)) {
    return res.status(400).json({ success: false, message: 'Invalid format' });
  }
  if (!name || !role || !department) {
    return res.status(400).json({ success: false, message: 'name, role and department are required' });
  }

  try {
    const newEmp = await addEmployee({ name, role, department });
    res.status(201).json({ success: true, employee: newEmp });
  } catch (err) {
    console.error('Error inserting employee', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// delete an employee record (protected route)
app.delete('/employees/:id', loginMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee deleted', employee: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// update employee route, protected by JWT check + request validation in updateEmployee
app.put('/employees/:id', loginMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, role, department } = req.body;

  try {
    const updated = await updateEmployee(id, { name, role, department });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee updated', employee: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/verify', loginMiddleware, async (req, res) => {
  const { oldPassword } = req.body;
  const userId = req.user.id;
  try {
    const user = await findUser(userId);
    const match = await bcryptjs.compare(oldPassword, user.password);
    return res.json({valid: match});
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/change-password', loginMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  console.log(oldPassword, newPassword);
  try {
    const user = await findUser(userId);
    const match = await bcryptjs.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Old password incorrect" });
    }
    const hashed = await bcryptjs.hash(newPassword, 12);
    await updatePassword(userId, hashed);
    res.json({ success: true, message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
});