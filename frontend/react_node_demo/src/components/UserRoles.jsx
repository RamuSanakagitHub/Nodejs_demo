import { useState, useEffect } from 'react';
import './Page.css';
import apiService from '../services/apiService';
import ReactPaginate from 'react-paginate';

const UserRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [page, setPage]=useState(1);
  const [pageSize, setPageSize]=useState(10);
  const [totalPages, setTotalPages]=useState(1);

  const token = localStorage.getItem('accessToken');

  const modules = ['Dashboard', 'Users', 'Roles', 'Assign Roles'];
  const permissionTypes = ['View', 'Create', 'Edit', 'Delete'];

  const fetchUsers = async () => {
    try {
      const response = await apiService.getAllUsers(token,page,pageSize);
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      setUsers(result.data);
      setTotalPages(result.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page,pageSize]);

  const handleActionClick = (user) => {
    setSelectedUser(user);
    // Initialize permissions if not set
    const userPermissions = user.permissions || {};
    const initialPermissions = {};
    modules.forEach(module => {
      initialPermissions[module.toLowerCase().replace(' ', '')] = userPermissions[module.toLowerCase().replace(' ', '')] || {};
      permissionTypes.forEach(perm => {
        initialPermissions[module.toLowerCase().replace(' ', '')][perm.toLowerCase()] = userPermissions[module.toLowerCase().replace(' ', '')]?.[perm.toLowerCase()] || false;
      });
    });
    setPermissions(initialPermissions);
    setShowPopup(true);
  };

  const handlePermissionChange = (module, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: checked
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      const response = await apiService.updateUser(selectedUser._id, { permissions }, token);
      if (!response.ok) throw new Error('Failed to update permissions');
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, permissions } : u));
      setShowPopup(false);
      setSelectedUser(null);
      setPermissions({});
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">Error: {error}</div>;

  return (
    <div className="page">
      <h2>Assign Roles to Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span onClick={() => handleActionClick(user)} style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>✏️</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display:"flex", justifyContent:'space-between'}}>
              <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1); // reset to first page
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={(selectedItem) => setPage(selectedItem.selected + 1)}
              containerClassName={"pagination"}
              activeClassName={"active"}
              forcePage={page - 1} // to sync with state
            />
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
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80%',
            overflowY: 'auto'
          }}>
            <h3>Manage Permissions for {selectedUser?.name}</h3>
            {modules.map(module => (
              <div key={module} style={{ marginBottom: '20px' }}>
                <h4>{module}</h4>
                {permissionTypes.map(perm => (
                  <label key={perm} style={{ display: 'block', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      checked={permissions[module.toLowerCase().replace(' ', '')]?.[perm.toLowerCase()] || false}
                      onChange={(e) => handlePermissionChange(module.toLowerCase().replace(' ', ''), perm.toLowerCase(), e.target.checked)}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={handleSavePermissions}>Save</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
