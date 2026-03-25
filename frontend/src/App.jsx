
import Header from "./pages/Header.jsx";
import Main from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ProfileProvider } from "./contexts/ProfileContext.jsx";
import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";

function App() {
  return (
    <Router>
      <Header />
        <ProfileProvider>
          
          <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/employees' element={<EmployeeDirectory />}/>
            <Route path='/profile' element={<Profile></Profile>}/>
          </Routes>
        </ProfileProvider>
    </Router>
  );
}

export default App;
