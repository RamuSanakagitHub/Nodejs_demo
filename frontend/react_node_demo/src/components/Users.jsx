import { useState, useEffect } from 'react';
import './Page.css';
import apiService from '../services/apiService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', age: '', role: 'user' });
  const [editForm, setEditForm] = useState({ name: '', email: '', age: '', role: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingUserData, setEditingUserData] = useState(null);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const response = await apiService.getAllUsers(token);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getAllRoles(token);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.saveUser(newUser, token);
      if (!response.ok) throw new Error('Failed to create user');
      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setNewUser({ name: '', email: '', age: '', role: 'user' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserData(user);
    setEditForm({ name: user.name, email: user.email, age: user.age, role: user.role });
    setShowEditPopup(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.updateUser(editingUserData._id, editForm, token);
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === editingUserData._id ? updatedUser : u));
      setShowEditPopup(false);
      setEditingUserData(null);
      setEditForm({ name: '', email: '', age: '', role: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await apiService.deleteUser(id, token);
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">Error: {error}</div>;

  return (
    <div className="page">
      <h2>Users</h2>
       <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button onClick={() => setShowPopup(true)} style={{ width: 'fit-content' }}>Add User</button>
      </div>      
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
        <h3>Add New User</h3>
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={newUser.age}
          onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          {roles.map(role => (
            <option key={role._id} value={role.name.toLowerCase()}>{role.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button type="submit">Add User</button>
          <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      </form>
      </div>
      </div>
    )}
      {showEditPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
        <h3>Edit User</h3>
      <form onSubmit={handleUpdateUser}>
        <input
          type="text"
          placeholder="Name"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={editForm.email}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={editForm.age}
          onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
          required
        />
        <select
          value={editForm.role}
          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
        >
          {roles.map(role => (
            <option key={role._id} value={role.name.toLowerCase()}>{role.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between',gap:'10px', marginTop: '10px' }}>
          <button type="submit" className='btn-signin'>Update User</button>
          <button type="button" onClick={() => setShowEditPopup(false)} className='btn-signup'>Cancel</button>
        </div>
      </form>
      </div>
      </div>
    )}
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>{user.role}</td>
              <td>
                <span onClick={() => handleEditUser(user)} style={{ fontSize: '18px', background: 'none', border: 'none', marginRight: '5px', cursor: 'pointer' }}>✏️</span>
                <span onClick={() => handleDeleteUser(user._id)} style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
