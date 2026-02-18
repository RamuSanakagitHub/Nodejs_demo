import { useNavigate } from 'react-router-dom';
import './Header.css';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate =useNavigate();
  const handleLogout = async () =>{
    try{
      const res = await apiService.logout();
      if(res.ok){ 
        const data = await res.json();
        toast.success(data.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");  // Add if needed
        localStorage.removeItem("role");  // Add if needed
        navigate("/signin");
      }else {
        const data = await res.json();
        toast.error(data.message);
      }      
    }catch(err) {
      toast.error("Network error");
    }
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
