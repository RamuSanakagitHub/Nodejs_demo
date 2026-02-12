import './Page.css';

const Dashboard = () => {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="dashboard-content">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>150</p>
        </div>
        <div className="stat-card">
          <h3>Active Roles</h3>
          <p>5</p>
        </div>
        <div className="stat-card">
          <h3>Permissions</h3>
          <p>25</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
