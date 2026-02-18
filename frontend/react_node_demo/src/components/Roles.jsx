import { useState, useEffect } from 'react';
import './Page.css';
import apiService from '../services/apiService';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', permissions: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingRoleData, setEditingRoleData] = useState(null);
  const token = localStorage.getItem('accessToken');

  const fetchRoles = async () => {
    try {
      const response = await apiService.getAllRoles(token);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const permissionsArray = newRole.permissions.split(',').map(p => p.trim());
      const response = await apiService.saveRole({ ...newRole, permissions: permissionsArray }, token);
      if (!response.ok) throw new Error('Failed to create role');
      const createdRole = await response.json();
      setRoles([...roles, createdRole]);
      setNewRole({ name: '', description: '', permissions: '' });
      setShowPopup(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRole = (role) => {
    setEditingRoleData(role);
    setEditForm({ name: role.name, description: role.description, permissions: role.permissions.join(', ') });
    setShowEditPopup(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const permissionsArray = editForm.permissions.split(',').map(p => p.trim());
      const response = await apiService.updateRole(editingRoleData._id, { ...editForm, permissions: permissionsArray }, token);
      if (!response.ok) throw new Error('Failed to update role');
      const updatedRole = await response.json();
      setRoles(roles.map(r => r._id === editingRoleData._id ? updatedRole : r));
      setShowEditPopup(false);
      setEditingRoleData(null);
      setEditForm({ name: '', description: '', permissions: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      const response = await apiService.deleteRole(id, token);
      if (!response.ok) throw new Error('Failed to delete role');
      setRoles(roles.filter(r => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">Error: {error}</div>;

  return (
    <div className="page">
      <h2>Roles</h2>
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button onClick={() => setShowPopup(true)} style={{ width: 'fit-content' }}>Add Role</button>
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
            <h3>Add New Role</h3>
            <form onSubmit={handleCreateRole}>
              <input
                type="text"
                placeholder="Role Name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                required
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Permissions (comma separated)"
                value={newRole.permissions}
                onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                required
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Add Role</button>
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Edit Role</h3>
            <form onSubmit={handleUpdateRole}>
              <input
                type="text"
                placeholder="Role Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Permissions (comma separated)"
                value={editForm.permissions}
                onChange={(e) => setEditForm({ ...editForm, permissions: e.target.value })}
                required
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap:'10px'}}>
                <button type="submit" className='btn-signin'>Update Role</button>
                <button type="button" onClick={() => setShowEditPopup(false)}  className='btn-signup'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role._id}>
              <td>{index + 1}</td>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>{role.permissions.join(', ')}</td>
              <td>
                <span onClick={() => handleEditRole(role)} style={{ fontSize: '18px', background: 'none', border: 'none', marginRight: '5px', cursor: 'pointer' }}>✏️</span>
                <span onClick={() => handleDeleteRole(role._id)} style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
