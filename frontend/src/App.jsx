
import Header from "./components/Header.jsx";
import Main from "./components/Main.jsx";
import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ProfileProvider } from "./contexts/ProfileContext.jsx";

function App() {
  return (
    <Router>
      <Header />
      <ProfileProvider>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/employees' element={<EmployeeDirectory />} />
        </Routes>
      </ProfileProvider>
    </Router>
  );
}

export default App;
