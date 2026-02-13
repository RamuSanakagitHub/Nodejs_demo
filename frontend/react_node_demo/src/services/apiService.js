const BASE_URL = 'http://localhost:5000/api';

const apiService = {
  // Auth endpoints
  login: (email, password) => {
    return fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  register: (userData) => {
    return fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  // Users endpoints
  getAllUsers: (token) => {
    return fetch(`${BASE_URL}/users/getAll`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  saveUser: (userData, token) => {
    return fetch(`${BASE_URL}/users/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },

  updateUser: (id, userData, token) => {
    return fetch(`${BASE_URL}/users/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (id, token) => {
    return fetch(`${BASE_URL}/users/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Roles endpoints
  getAllRoles: (token) => {
    return fetch(`${BASE_URL}/roles/getAll`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  saveRole: (roleData, token) => {
    return fetch(`${BASE_URL}/roles/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });
  },

  updateRole: (id, roleData, token) => {
    return fetch(`${BASE_URL}/roles/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });
  },

  deleteRole: (id, token) => {
    return fetch(`${BASE_URL}/roles/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  /** upload related Apis  */
  
  uploadFile: (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${BASE_URL}/upload/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },
  uploadMultipleFiles: (files,token) =>{
    return fetch(`${BASE_URL}/upload/save/multiple`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: files,
    });
  },

  fetchFileById: (fileId, token) => {
    return fetch(`${BASE_URL}/upload/get/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  /** export excelUsers */
  fetchExportUsers: (token) => {
    return fetch(`${BASE_URL}/users/export`,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }
  
};


export default apiService;
