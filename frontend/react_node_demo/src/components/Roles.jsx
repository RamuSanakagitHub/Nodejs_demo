import './Page.css';

const Roles = () => {
  const roles = [
    { id: 1, name: 'Admin', permissions: ['Read', 'Write', 'Delete', 'Manage Users'] },
    { id: 2, name: 'User', permissions: ['Read', 'Write'] },
    { id: 3, name: 'Moderator', permissions: ['Read', 'Write', 'Moderate'] },
  ];

  return (
    <div className="page">
      <h2>Roles</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>{role.permissions.join(', ')}</td>
              <td>
                <button className="action-btn">Edit</button>
                <button className="action-btn delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
