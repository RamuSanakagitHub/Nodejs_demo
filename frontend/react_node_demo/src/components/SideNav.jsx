import { Link, useLocation } from 'react-router-dom';
import './SideNav.css';

const SideNav = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/users', label: 'Users' },
    { path: '/roles', label: 'Roles' },
  ];

  return (
    <nav className="side-nav">
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNav;
