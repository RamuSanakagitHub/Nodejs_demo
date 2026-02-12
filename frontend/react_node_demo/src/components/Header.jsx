import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Role-Based Access Management</h1>
        <div className="header-user">
          <span>Welcome, Admin</span>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
