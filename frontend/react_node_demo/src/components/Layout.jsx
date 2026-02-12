import { Outlet } from 'react-router-dom';
import Header from './Header';
import SideNav from './SideNav';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <SideNav />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
