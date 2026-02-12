import React from 'react';
import './Auth.css'
import { Link } from 'react-router-dom';


function Home() {
  return (
    <div className="home">
      <h1>Role-Based Access Management Demo</h1>
      <p>Welcome to the RBAC demo project. Manage user roles and permissions effectively.</p>   
       <nav className='btn-group'>
          <Link to="/signin" className='btn-signin'>Sign In</Link>
          <Link to="/signup" className='btn-signup'>Sign Up</Link>
        </nav>   
    </div>
  );
}

export default Home;