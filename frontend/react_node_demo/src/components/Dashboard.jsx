import { useState, useEffect } from 'react';
import './Page.css';
import apiService from '../services/apiService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiService.getAllUsers(token),
        apiService.getAllRoles(token),
      ]);

      if (!usersRes.ok || !rolesRes.ok) throw new Error('Failed to fetch data');

      const users = await usersRes.json();
      const roles = await rolesRes.json();

      const totalPermissions = roles.reduce((sum, role) => sum + role.permissions.length, 0);

      setStats({
        totalUsers: users.length,
        totalRoles: roles.length,
        totalPermissions,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">Error: {error}</div>;

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="dashboard-content">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Roles</h3>
          <p>{stats.totalRoles}</p>
        </div>
        <div className="stat-card">
          <h3>Permissions</h3>
          <p>{stats.totalPermissions}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
