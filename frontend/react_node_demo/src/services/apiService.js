const BASE_URL = 'http://localhost:5000/api';
const getAccessToken = () => localStorage.getItem('accessToken');

  const refreshTokens = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    window.location.href = '/signin';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
};

const authenticatedFetch = async (url, options = {}) => {
  const token = getAccessToken();
  if (!token) {
    window.location.href = '/signin';
    throw new Error('No access token');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      const newToken = await refreshTokens();
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      throw error;
    }
  }

  return response;
};
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
refresh: () => refreshTokens(),

// logout: async () => {
//   const token = getAccessToken();
//   if (token) {
//     await authenticatedFetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
//   }
//   localStorage.removeItem('accessToken');
//   localStorage.removeItem('refreshToken');
//   localStorage.removeItem('role');
//   window.location.href = '/signin';
// },
logout: async () => {
  const token = getAccessToken();
  if (token) {
    return await authenticatedFetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
  }
  // Don't clear storage or navigate here—let the component do it
  throw new Error("No token available");  // Or handle as needed
},

  // Users endpoints
  getAllUsers: (token,page,limit) => {
    return fetch(`${BASE_URL}/users/getAll?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUserById: (id, token) => {
    return fetch(`${BASE_URL}/users/get/${id}`, {
      method: 'GET',
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
  },
  // ==================== AGGREGATION PIPELINES ====================
  // LEVEL 1: BASIC STAGES
  filterUsersByRole: (role, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/filter/${role}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersWithProjectedFields: (token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/projected?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersSortedByAge: (sortOrder, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/sorted?sortOrder=${sortOrder}&page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getTopUsers: (limit, token, page = 1, pageLimit = 10) => {
    return fetch(`${BASE_URL}/users/top?limit=${limit}&page=${page}&pageLimit=${pageLimit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersWithSkip: (skip, limit, token, page = 1, pageLimit = 10) => {
    return fetch(`${BASE_URL}/users/skipped?skip=${skip}&limit=${limit}&page=${page}&pageLimit=${pageLimit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 2: GROUPING & CALCULATIONS
  getUserCountByRole: (token) => {
    return fetch(`${BASE_URL}/users/count-by-role`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getTotalAgeByRole: (token) => {
    return fetch(`${BASE_URL}/users/total-age-by-role`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRoleStatistics: (token) => {
    return fetch(`${BASE_URL}/users/role-statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 4: ADVANCED STAGES
  getUsersWithRoleDetails: (token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/with-role-details?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getAgeDistribution: (token) => {
    return fetch(`${BASE_URL}/users/age-distribution`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getDashboardStats: (token) => {
    return fetch(`${BASE_URL}/users/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 5: PERFORMANCE OPTIMIZATION
  getAllUsersWithDiskUse: (token) => {
    return fetch(`${BASE_URL}/users/all-with-disk-use`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getComplexStatsWithLargeData: (token) => {
    return fetch(`${BASE_URL}/users/complex-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getPaginatedUsersWithAggregation: (page, limit, token) => {
    return fetch(`${BASE_URL}/users/paginated-aggregation?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
// ==================== ARRAY & NESTED QUERYING METHODS ====================
  // LEVEL 1: Simple Arrays
  getUsersBySkill: (skill, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/skill/${skill}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersBySkillsAll: (skills, token, page = 1, limit = 10) => {
    const params = new URLSearchParams({ skills: skills.join(','), page: page.toString(), limit: limit.toString() });
    return fetch(`${BASE_URL}/users/skills-all?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersBySkillsIn: (skills, token, page = 1, limit = 10) => {
    const params = new URLSearchParams({ skills: skills.join(','), page: page.toString(), limit: limit.toString() });
    return fetch(`${BASE_URL}/users/skills-in?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersBySkillsSize: (size, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/skills-size/${size}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 2: Nested Objects
  getUsersByAddressCity: (city, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/address-city/${city}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersByAddressPincodeGt: (pincode, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/address-pincode-gt/${pincode}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 3: Arrays of Objects
  getUsersByProjectTitle: (title, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/project-title/${title}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersWithProjectsElemMatch: (title, budget, token, page = 1, limit = 10) => {
    const params = new URLSearchParams({ title, budget: budget.toString(), page: page.toString(), limit: limit.toString() });
    return fetch(`${BASE_URL}/users/projects-elem-match?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 4: Nested Arrays inside Arrays
  getUsersByProjectTechnologies: (technology, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/project-technologies/${technology}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersWithProjectsElemMatchTech: (technology, budget, token, page = 1, limit = 10) => {
    const params = new URLSearchParams({ technology, budget: budget.toString(), page: page.toString(), limit: limit.toString() });
    return fetch(`${BASE_URL}/users/projects-elem-match-tech?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // LEVEL 5: Advanced Array Operators
  getUsersWithAddressExists: (token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/address-exists?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersByAgeType: (type, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/age-type/${type}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsersWithProjectsSlice: (slice, token, page = 1, limit = 10) => {
    return fetch(`${BASE_URL}/users/projects-slice/${slice}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Real-World Example (Production-Level Query)
  getUsersProductionQuery: (city, skillsSize, technology, budget, token, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      city,
      skillsSize: skillsSize.toString(),
      technology,
      budget: budget.toString(),
      page: page.toString(),
      limit: limit.toString()
    });
    return fetch(`${BASE_URL}/users/production-query?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
};


export default apiService;
