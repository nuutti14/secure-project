
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import express from 'express';
import pool from './db.js';
import {rateLimit} from 'express-rate-limit';
import verifyCaptcha from './recaptchaMiddleware.js';
import sanitize from 'sanitize';
import validator from 'validator'

// Load environment variables
configDotenv();

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

// Secret key for signing JWTs
const JWT_KEY = process.env.JWT_KEY;

// Initialize the Express app
const app = express();

// Middleware to handle CORS and parse incoming data
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(('/login', '/register', '/employees'), limiter)
app.use(sanitize.middleware)

// helper to add user to database
async function addUser({ username, password }) {
  const text = `INSERT INTO users(username, password)
                VALUES($1, $2) RETURNING *`;
  const values = [username, password];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

// helper to look up user by username
async function findUser(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  return rows[0];
}

// Register Route
app.post('/register', verifyCaptcha, async (req, res) => {
  try {
    const { username, password } = req.body;

    // check database for existing user
    const existing = await findUser(username);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password before storing
    const salt = await bcryptjs.genSalt(10);
    const hashedPass = await bcryptjs.hash(password, 10);

    // insert into database
    const newUser = await addUser({ username, password: hashedPass });

    res.status(201).json({ success: true, message: 'New user created!', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existing = await findUser(username);

    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify password
    const isPassValid = await bcryptjs.compare(password, existing.password);
    if (!isPassValid) {
      return res.status(404).json({ success: false, message: 'Invalid password' });
    }

    // Create a JWT token
    const payload = { username };
    const token = jwt.sign(payload, JWT_KEY, { expiresIn: '24h' });

    res.status(200).json({ token, success: true, message: 'Logged in successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

async function addEmployee({ name, role, department }) {
  const text = `INSERT INTO employees(name, role, department)
                VALUES($1, $2, $3) RETURNING *`;
  const values = [name, role, department];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

async function deleteEmployee(id) {
  const text = `DELETE FROM employees WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(text, [id]);
  return rows[0];
}

async function updateEmployee(id, { name, role, department }) {
  const text = `UPDATE employees
                SET name = $1, role = $2, department = $3
                WHERE id = $4
                RETURNING *`;
  const values = [name, role, department, id];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

// Middleware to Protect Routes
const loginMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Inexistent or invalid token' });
  }

  // Verify token
  jwt.verify(token, JWT_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });

    req.user = user;
    next();
  });
};


// Protected Profile Route
app.get('/profile', loginMiddleware, (req, res) => {
  const username = req.user.username;
  res.json({ success: true, message: `Welcome, ${username}!` });
});

// Employees CRUD routes

// helper to retrieve employees, optionally filtering by name
async function getEmployees(name) {
  if (name) {
    const text = `SELECT * FROM employees
                  WHERE name ILIKE $1
                  ORDER BY id ASC`;
    const { rows } = await pool.query(text, [`%${name}%`]);
    return rows;
  } else {
    const { rows } = await pool.query('SELECT * FROM employees ORDER BY id ASC');
    return rows;
  }
}

// list (or search) employees
app.get('/employees', loginMiddleware, async (req, res) => {
  try {
    const { name } = req.query; // search term
    const employees = await getEmployees(name);
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

function regexCheck(name, department, role) {
  const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
  const depRegex = /^[A-Za-z0-9\s]+$/;
  const roleRegex = /^[A-Za-z\s]+$/;
  return (nameRegex.test(name) && roleRegex.test(role) && depRegex.test(department));
}

// add a new employee
app.post('/employees', loginMiddleware, async (req, res) => {
  const { name, role, department } = req.body;
  if (!regexCheck(name,department,role)) {
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

// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
});