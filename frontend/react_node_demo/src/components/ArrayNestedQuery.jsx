import React, { useState } from 'react';
import apiService from '../services/apiService'; // Adjust the path to your ApiService.js file (e.g., '../services/ApiService')
import './Page.css'; // Import the CSS file
import styled from 'styled-components';
import ReactPaginate from 'react-paginate'; // Added for pagination

// Styled Components (matching AggregationDashboard)
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    background-color: #f8f9fa;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  align-items: center;
`;

const ArrayNestedQuery = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [queryType, setQueryType] = useState('skill');
  const [inputs, setInputs] = useState({
    skill: '',
    skills: '',
    size: '',
    city: '',
    pincode: '',
    title: '',
    budget: '',
    technology: '',
    type: '',
    slice: '',
    skillsSize: '',
    page: 1,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [pageSize, setPageSize] = useState(10); // For pagination
  const [totalPages, setTotalPages] = useState(1); // From API response

  const token = localStorage.getItem('accessToken'); // Assuming token is stored here; adjust if needed

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleQuery = async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      let response;
      switch (queryType) {
        // LEVEL 1: Simple Arrays
        case 'skill':
          response = await apiService.getUsersBySkill(inputs.skill, token, page, limit);
          break;
        case 'skillsAll':
          const skillsAll = inputs.skills ? inputs.skills.split(',') : [];
          response = await apiService.getUsersBySkillsAll(skillsAll, token, page, limit);
          break;
        case 'skillsIn':
          const skillsIn = inputs.skills ? inputs.skills.split(',') : [];
          response = await apiService.getUsersBySkillsIn(skillsIn, token, page, limit);
          break;
        case 'skillsSize':
          response = await apiService.getUsersBySkillsSize(inputs.size, token, page, limit);
          break;
        // LEVEL 2: Nested Objects
        case 'addressCity':
          response = await apiService.getUsersByAddressCity(inputs.city, token, page, limit);
          break;
        case 'addressPincodeGt':
          response = await apiService.getUsersByAddressPincodeGt(inputs.pincode, token, page, limit);
          break;
        // LEVEL 3: Arrays of Objects
        case 'projectTitle':
          response = await apiService.getUsersByProjectTitle(inputs.title, token, page, limit);
          break;
        case 'projectsElemMatch':
          response = await apiService.getUsersWithProjectsElemMatch(inputs.title, inputs.budget, token, page, limit);
          break;
        // LEVEL 4: Nested Arrays inside Arrays
        case 'projectTechnologies':
          response = await apiService.getUsersByProjectTechnologies(inputs.technology, token, page, limit);
          break;
        case 'projectsElemMatchTech':
          response = await apiService.getUsersWithProjectsElemMatchTech(inputs.technology, inputs.budget, token, page, limit);
          break;
        // LEVEL 5: Advanced Array Operators
        case 'addressExists':
          response = await apiService.getUsersWithAddressExists(token, page, limit);
          break;
        case 'ageType':
          response = await apiService.getUsersByAgeType(inputs.type, token, page, limit);
          break;
        case 'projectsSlice':
          response = await apiService.getUsersWithProjectsSlice(inputs.slice, token, page, limit);
          break;
        // Real-World Example
        case 'productionQuery':
          response = await apiService.getUsersProductionQuery(inputs.city, inputs.skillsSize, inputs.technology, inputs.budget, token, page, limit);
          break;
        default:
          throw new Error('Invalid query type');
      }
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
  setResults(data.data || []);
  setTotalPages(data.total_pages || 1);// Set total pages from API
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (selectedItem) => {
    const newPage = selectedItem.selected + 1;
    setCurrentPage(newPage);
    handleQuery(newPage, pageSize); // Re-query on page change
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
    handleQuery(1, newSize);
  };

  const renderInputs = () => {
    switch (queryType) {
      // LEVEL 1: Simple Arrays
      case 'skill':
        return (
          <input
            type="text"
            name="skill"
            placeholder="Enter skill (e.g., MongoDB)"
            value={inputs.skill}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'skillsAll':
      case 'skillsIn':
        return (
          <input
            type="text"
            name="skills"
            placeholder="Enter skills (comma-separated, e.g., Java,React)"
            value={inputs.skills}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'skillsSize':
        return (
          <input
            type="number"
            name="size"
            placeholder="Enter skills array size (e.g., 3)"
            value={inputs.size}
            onChange={handleInputChange}
            className="input"
          />
        );
      // LEVEL 2: Nested Objects
      case 'addressCity':
        return (
          <input
            type="text"
            name="city"
            placeholder="Enter city (e.g., Hyderabad)"
            value={inputs.city}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'addressPincodeGt':
        return (
          <input
            type="number"
            name="pincode"
            placeholder="Enter pincode greater than (e.g., 500000)"
            value={inputs.pincode}
            onChange={handleInputChange}
            className="input"
          />
        );
      // LEVEL 3: Arrays of Objects
      case 'projectTitle':
        return (
          <input
            type="text"
            name="title"
            placeholder="Enter project title (e.g., CRM)"
            value={inputs.title}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'projectsElemMatch':
        return (
          <>
            <input
              type="text"
              name="title"
              placeholder="Enter project title (e.g., CRM)"
              value={inputs.title}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="number"
              name="budget"
              placeholder="Enter budget (e.g., 50000)"
              value={inputs.budget}
              onChange={handleInputChange}
              className="input"
            />
          </>
        );
      // LEVEL 4: Nested Arrays inside Arrays
      case 'projectTechnologies':
        return (
          <input
            type="text"
            name="technology"
            placeholder="Enter technology (e.g., MongoDB)"
            value={inputs.technology}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'projectsElemMatchTech':
        return (
          <>
            <input
              type="text"
              name="technology"
              placeholder="Enter technology (e.g., MongoDB)"
              value={inputs.technology}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="number"
              name="budget"
              placeholder="Enter budget greater than (e.g., 80000)"
              value={inputs.budget}
              onChange={handleInputChange}
              className="input"
            />
          </>
        );
      // LEVEL 5: Advanced Array Operators
      case 'ageType':
        return (
          <input
            type="text"
            name="type"
            placeholder="Enter type (e.g., number)"
            value={inputs.type}
            onChange={handleInputChange}
            className="input"
          />
        );
      case 'projectsSlice':
        return (
          <input
            type="number"
            name="slice"
            placeholder="Enter slice (e.g., 1 for first project)"
            value={inputs.slice}
            onChange={handleInputChange}
            className="input"
          />
        );
      // Real-World Example
      case 'productionQuery':
        return (
          <>
            <input
              type="text"
              name="city"
              placeholder="Enter city (e.g., Hyderabad)"
              value={inputs.city}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="number"
              name="skillsSize"
              placeholder="Enter skills size (e.g., 3)"
              value={inputs.skillsSize}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="text"
              name="technology"
              placeholder="Enter technology (e.g., MongoDB)"
              value={inputs.technology}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="number"
              name="budget"
              placeholder="Enter budget greater than (e.g., 80000)"
              value={inputs.budget}
              onChange={handleInputChange}
              className="input"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h2 className="title">Array & Nested Querying</h2>
      <select value={queryType} onChange={(e) => setQueryType(e.target.value)} className="select">
        <optgroup label="LEVEL 1: Simple Arrays">
          <option value="skill">Users by Skill</option>
          <option value="skillsAll">Users by Skills (All)</option>
          <option value="skillsIn">Users by Skills (In)</option>
          <option value="skillsSize">Users by Skills Size</option>
        </optgroup>
        <optgroup label="LEVEL 2: Nested Objects">
          <option value="addressCity">Users by Address City</option>
          <option value="addressPincodeGt">Users by Address Pincode GT</option>
        </optgroup>
        <optgroup label="LEVEL 3: Arrays of Objects">
          <option value="projectTitle">Users by Project Title</option>
          <option value="projectsElemMatch">Users with Projects Elem Match</option>
        </optgroup>
        <optgroup label="LEVEL 4: Nested Arrays inside Arrays">
          <option value="projectTechnologies">Users by Project Technologies</option>
          <option value="projectsElemMatchTech">Users with Projects Elem Match Tech</option>
        </optgroup>
        <optgroup label="LEVEL 5: Advanced Array Operators">
          <option value="addressExists">Users with Address Exists</option>
          <option value="ageType">Users by Age Type</option>
          <option value="projectsSlice">Users with Projects Slice</option>
        </optgroup>
        <optgroup label="Real-World Example">
          <option value="productionQuery">Production Query</option>
        </optgroup>
      </select>
      <div className="input-group">
        {renderInputs()}
        <input
          type="number"
          name="page"
          placeholder="Page"
          value={inputs.page}
          onChange={handleInputChange}
          min="1"
          className="input"
        />
        <input
          type="number"
          name="limit"
          placeholder="Limit"
          value={inputs.limit}
          onChange={handleInputChange}
          min="1"
          className="input"
        />
      </div>
      <button onClick={() => handleQuery()} disabled={loading} className="button">
        {loading ? 'Loading...' : 'Query'}
      </button>
      {error && <p className="error">{error}</p>}
      <div className="results">
        <h3 className="results-title">Results:</h3>
        {results.length > 0 ? (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Address</th>
                  <th>Projects</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name || 'N/A'}</td>
                    <td>{item.email || 'N/A'}</td>
                    <td>{item.age || 'N/A'}</td>
                    <td>{item.role || 'N/A'}</td>
                    <td>{item.skills ? item.skills.join(', ') : 'N/A'}</td>
                    <td>{item.address ? `${item.address.city || 'N/A'}, ${item.address.state || 'N/A'}` : 'N/A'}</td>
                    <td>{item.projects ? item.projects.map(p => p.title || p.name).join(', ') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <PaginationControls>
              <select value={pageSize} onChange={handlePageSizeChange}>
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
                onPageChange={handlePageChange}
                containerClassName={"pagination"}
                activeClassName={"active"}
                forcePage={currentPage - 1}
              />
            </PaginationControls>
          </>
        ) : (
          !loading && <p className="no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default ArrayNestedQuery;