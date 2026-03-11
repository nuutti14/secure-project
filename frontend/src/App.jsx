
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import React, { useState, useEffect } from 'react';

// function App() {
//   const [employees, setEmployees] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:8080/api/employees')
//       .then(res => {
//         if (!res.ok) throw new Error('Security/Network error: ' + res.status);
//         return res.json();
//       })
//       .then(res => setEmployees(res))
//       .catch(err => setError(err.message));
      
//   }, []);

//   console.log(employees)

//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <h1>Secure Employee Directory</h1>
      
//       {/* {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ Error: {error}</div>} */}
      
//       <section style={{ marginBottom: '20px' }}>
//         <input type="text" placeholder="Search employees..." style={{ padding: '8px' }} />
//         <button style={{ marginLeft: '10px' }}>Search</button>
//       </section>

//       <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f4f4f4' }}>
//             <th>ID</th>
//             <th>Name</th>
//             <th>Role</th>
//             <th>Department</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees.map(emp => (
//             <tr key={emp.id}>
//               <td>{emp.id}</td>
//               <td>{emp.name}</td>
//               <td>{emp.role}</td>
//               <td>{emp.department}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default App
// Import React components and routing tools
import Header from "./components/Header.jsx";
import Main from "./components/Main.jsx";
import Profile from "./pages/Profile.jsx";
import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';

// Import the context provider to manage global user state
import { ProfileProvider } from "./contexts/ProfileContext.jsx";

function App() {
  return (
    <Router>
      {/* Header that is always visible */}
      <Header />

      {/* Wrap the app in ProfileProvider to share user state */}
      <ProfileProvider>
        <Routes>
          {/* Home route – renders login/signup form */}
          <Route path='/' element={<Main />} />

          {/* Protected profile route
          <Route path='/profile' element={<Profile />} /> */}
          
          {/* Employee directory route (shown after login) */}
          <Route path='/employees' element={<EmployeeDirectory />} />
        </Routes>
      </ProfileProvider>
    </Router>
  );
}

export default App;
