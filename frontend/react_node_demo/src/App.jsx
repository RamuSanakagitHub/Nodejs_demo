import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Roles from './components/Roles';
import UserRoles from './components/UserRoles';
import socketService from './services/socketService';
import './App.css'
import AggregationDashboard from './components/AggregationDashboard';
import ArrayNestedQuery from './components/ArrayNestedQuery';

function App() {
  useEffect(() => {
    // Connect to socket when app mounts
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/user-roles" element={<UserRoles />} />
            <Route path="/aggregation-dashboard" element={<AggregationDashboard />} />
            <Route path="/array-nested-query" element={<ArrayNestedQuery />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
