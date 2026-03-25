import pool from './db.js';

export async function addUser({ username, password }) {
  const text = `INSERT INTO users(username, password)
                VALUES($1, $2) RETURNING *`;
  const values = [username, password];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

// helper to look up user by username
export async function findUser(userId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
  return rows[0];
}

export async function findUserName(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  return rows[0];
}

export async function addEmployee({ name, role, department }) {
  const text = `INSERT INTO employees(name, role, department)
                VALUES($1, $2, $3) RETURNING *`;
  const values = [name, role, department];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

export async function deleteEmployee(id) {
  const text = `DELETE FROM employees WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(text, [id]);
  return rows[0];
}

export async function updateEmployee(id, { name, role, department }) {
  const text = `UPDATE employees
                SET name = $1, role = $2, department = $3
                WHERE id = $4
                RETURNING *`;
  const values = [name, role, department, id];
  const { rows } = await pool.query(text, values);
  return rows[0];
}

export async function getEmployees(name) {
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

export async function updatePassword(id, password) {
    
    const text = `UPDATE users
                    SET password = $1
                    WHERE id = $2
                    RETURNING *`;
    const values = [password, id];
    const { rows } = await pool.query(text, values);
    return rows;
    
}