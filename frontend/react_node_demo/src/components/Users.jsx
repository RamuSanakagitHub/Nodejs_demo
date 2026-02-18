  import { useState, useEffect } from 'react';
  import './Page.css';
  import apiService from '../services/apiService';
  import socketService from '../services/socketService';
  import ReactPaginate from 'react-paginate';
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
    const [newUserFile, setNewUserFile] = useState(null);
    const [editUserFile, setEditUserFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileUrls, setFileUrls] = useState({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(1);


    const token = localStorage.getItem('accessToken');
    const defaultUrl = "https://deiijhplbipzjmnjwoln.supabase.co/storage/v1/object/public/images/uploads/1770962653279-lxr94.png";

    const handleFileUpload = async (file) => {
      if (!file) return null;
      
      try {
        setUploading(true);
        const response = await apiService.uploadFile(file, token);
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        const result = await response.json();
        setUploading(false);    
        return result.mongoFile._id;
      } catch (err) {
        console.error('File upload error:', err);
        setUploading(false);
        throw err;
      }
    };

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
    const fetchAllFileUrls = async () => {
      const newFileUrls = {};
      for (const user of users) {
        if (user.fileId && !fileUrls[user.fileId]) {
          try {
            const response = await apiService.fetchFileById(user.fileId, token);
            if (response.ok) {
              const data = await response.json();
              newFileUrls[user.fileId] = data.fileUrl;
            }
          } catch (err) {
            console.error("Error fetching file for user:", user.name, err);
          }
        }
      }
      setFileUrls(prev => ({ ...prev, ...newFileUrls }));
    };

    useEffect(() => {
      fetchUsers();
      fetchRoles();
      socketService.connect()
      const handleNewUser = (newUser) => {
        setUsers(prevUsers => [...prevUsers, newUser]);
      };
      socketService.on("userCreated", handleNewUser);

      // Cleanup on unmount
      return () => {
        socketService.off("userCreated", handleNewUser);
        socketService.disconnect();
      };
    }, [page,pageSize]);

    useEffect(() => {
      if (users.length === 0) return;
      fetchAllFileUrls();
    }, [users]);

    const handleCreateUser = async (e) => {
      e.preventDefault();
      try {
        let fileId = null;
        if(newUserFile){
          fileId = await handleFileUpload(newUserFile);
        }
        const payload = {
          ...newUser,
          password: 'Rbac@1234',
          fileId
        }
        const response = await apiService.saveUser(payload, token);
        if (!response.ok) throw new Error('Failed to create user');
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setNewUser({ name: '', email: '', age: '', role: 'user'});
        setShowPopup(false);
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
    const handleExport = async () => {
      if (!window.confirm('Are you sure you want to export this users?')) return;
      try{
        const response = await apiService.fetchExportUsers(token);
        if (!response.ok) throw new Error('Failed to export users');
          // Convert response to blob
        const blob = await response.blob();

        // Create a temporary link element
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set file name
        link.download = 'users.xlsx';

        // Append to body and trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
      }catch(err){
        setError(err.message);
      }
    }

    if (loading) return <div className="page">Loading...</div>;
    if (error) return <div className="page">Error: {error}</div>;

    return (
      <div className="page">
        <h2>Users</h2>
        <div style={{ display:'flex', gap:'10px', marginBottom: '10px',alignContent:'flex-end',justifyContent:'flex-end' }}>
          <button onClick={handleExport} style={{ width: 'fit-content' }}>Export Users</button>
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
            type="file"
            placeholder='Drag and drop the image or upload file'         
            onChange={(e) => setNewUserFile(e.target.files[0])}
            required
          />
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
            <button type="submit">Save</button>
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
            type="file"
            placeholder='Drag and drop the image or upload file'     
            onChange={(e) => setEditUserFile(e.target.files[0])}
            required
          />
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
            <button type="submit" className='btn-signin'>Update</button>
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
              <th>Profile</th>
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
                <td><img
                  src={user.fileId ? fileUrls[user.fileId] || defaultUrl : defaultUrl}
                  alt="Profile"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "8px"
                  }}
                /></td>
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

      </div>
    );
  };

  export default Users;
