import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Roles from './components/Roles';
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/users" element={<Layout><Users /></Layout>} />
          <Route path="/roles" element={<Layout><Roles /></Layout>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
