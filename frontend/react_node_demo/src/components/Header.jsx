import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate =useNavigate();
  const handleLogout = () =>{
    navigate("/signin");
    localStorage.removeItem("accessToken");
  }
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Role-Based Access Management</h1>
        <div className="header-user">
          <span>Welcome, Admin</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
