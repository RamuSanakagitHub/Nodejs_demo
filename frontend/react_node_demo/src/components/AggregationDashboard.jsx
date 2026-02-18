import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import ReactPaginate from 'react-paginate';
import apiService from '../services/apiService'; // Adjust path if needed

// Styled Components
const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  min-height: 100vh;
`;

const Header = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
`;

const Section = styled.section`
  margin-bottom: 40px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #555;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

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

const List = styled.ul`
  list-style: none;
  padding: 0;
  li {
    padding: 5px 0;
  }
`;

const ChartContainer = styled.div`
  margin-top: 20px;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  align-items: center;
`;

const AggregationDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    role: 'admin',
    sortOrder: 1,
    limit: 5,
    skip: 10,
  });

  // Pagination states for each large data section
  const [filteredPage, setFilteredPage] = useState(1);
  const [filteredPageSize, setFilteredPageSize] = useState(10);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);

  const [projectedPage, setProjectedPage] = useState(1);
  const [projectedPageSize, setProjectedPageSize] = useState(10);
  const [projectedTotalPages, setProjectedTotalPages] = useState(1);

  const [sortedPage, setSortedPage] = useState(1);
  const [sortedPageSize, setSortedPageSize] = useState(10);
  const [sortedTotalPages, setSortedTotalPages] = useState(1);

  const [topPage, setTopPage] = useState(1);
  const [topPageSize, setTopPageSize] = useState(10);
  const [topTotalPages, setTopTotalPages] = useState(1);

  const [skippedPage, setSkippedPage] = useState(1);
  const [skippedPageSize, setSkippedPageSize] = useState(10);
  const [skippedTotalPages, setSkippedTotalPages] = useState(1);

  const [roleDetailsPage, setRoleDetailsPage] = useState(1);
  const [roleDetailsPageSize, setRoleDetailsPageSize] = useState(10);
  const [roleDetailsTotalPages, setRoleDetailsTotalPages] = useState(1);

  // Existing pagination for "Paginated Users"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('accessToken');

  const fetchData = async () => {
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [
        filteredUsersRes,
        projectedUsersRes,
        sortedUsersRes,
        topUsersRes,
        skippedUsersRes,
        countByRoleRes,
        totalAgeByRoleRes,
        roleStatsRes,
        usersWithDetailsRes,
        ageDistRes,
        dashboardStatsRes,
        allWithDiskRes,
        complexStatsRes,
        paginatedUsersRes,
      ] = await Promise.all([
        apiService.filterUsersByRole(params.role, token, filteredPage, filteredPageSize),
        apiService.getUsersWithProjectedFields(token, projectedPage, projectedPageSize),
        apiService.getUsersSortedByAge(params.sortOrder, token, sortedPage, sortedPageSize),
        apiService.getTopUsers(params.limit, token, topPage, topPageSize),
        apiService.getUsersWithSkip(params.skip, 10, token, skippedPage, skippedPageSize),
        apiService.getUserCountByRole(token),
        apiService.getTotalAgeByRole(token),
        apiService.getRoleStatistics(token),
        apiService.getUsersWithRoleDetails(token, roleDetailsPage, roleDetailsPageSize),
        apiService.getAgeDistribution(token),
        apiService.getDashboardStats(token),
        apiService.getAllUsersWithDiskUse(token),
        apiService.getComplexStatsWithLargeData(token),
        apiService.getPaginatedUsersWithAggregation(page, pageSize, token),
      ]);

      const [
        filteredUsers,
        projectedUsers,
        sortedUsers,
        topUsers,
        skippedUsers,
        countByRole,
        totalAgeByRole,
        roleStats,
        usersWithDetails,
        ageDist,
        dashboardStats,
        allWithDisk,
        complexStats,
        paginatedUsersResult,
      ] = await Promise.all([
        filteredUsersRes.json(),
        projectedUsersRes.json(),
        sortedUsersRes.json(),
        topUsersRes.json(),
        skippedUsersRes.json(),
        countByRoleRes.json(),
        totalAgeByRoleRes.json(),
        roleStatsRes.json(),
        usersWithDetailsRes.json(),
        ageDistRes.json(),
        dashboardStatsRes.json(),
        allWithDiskRes.json(),
        complexStatsRes.json(),
        paginatedUsersRes.json(),
      ]);

      setData({
        filteredUsers: filteredUsers.data,
        projectedUsers: projectedUsers.data,
        sortedUsers: sortedUsers.data,
        topUsers: topUsers.data,
        skippedUsers: skippedUsers.data,
        countByRole,
        totalAgeByRole,
        roleStats,
        usersWithDetails: usersWithDetails.data,
        ageDist,
        dashboardStats,
        allWithDisk,
        complexStats,
        paginatedUsers: paginatedUsersResult.data,
      });
      setFilteredTotalPages(filteredUsers.total_pages);
      setProjectedTotalPages(projectedUsers.total_pages);
      setSortedTotalPages(sortedUsers.total_pages);
      setTopTotalPages(topUsers.total_pages);
      setSkippedTotalPages(skippedUsers.total_pages);
      setRoleDetailsTotalPages(usersWithDetails.total_pages);
      setTotalPages(paginatedUsersResult.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filteredPage, filteredPageSize, projectedPage, projectedPageSize, sortedPage, sortedPageSize, topPage, topPageSize, skippedPage, skippedPageSize, roleDetailsPage, roleDetailsPageSize, page, pageSize]);

  const handleParamChange = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  const refreshData = () => {
    fetchData();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  // Prepare chart data
  const countByRoleChart = (data.countByRole || []).map(item => ({ name: item._id, value: item.totalUsers }));
  const ageDistChart = (data.ageDist || []).map(item => ({ name: item._id, value: item.count }));

  return (
    <Container>
      <Header>MongoDB Aggregation Dashboard</Header>
      <Controls>
        <label>Role for Filter: <Input value={params.role} onChange={(e) => handleParamChange('role', e.target.value)} /></label>
        <label>Sort Order (1=asc, -1=desc): <Input type="number" value={params.sortOrder} onChange={(e) => handleParamChange('sortOrder', parseInt(e.target.value))} /></label>
        <label>Limit for Top: <Input type="number" value={params.limit} onChange={(e) => handleParamChange('limit', parseInt(e.target.value))} /></label>
        <label>Skip: <Input type="number" value={params.skip} onChange={(e) => handleParamChange('skip', parseInt(e.target.value))} /></label>
        <Button onClick={refreshData}>Search Data</Button>
      </Controls>

      {/* LEVEL 1: BASIC STAGES */}
      <Section>
        <SectionTitle>Level 1: Basic Stages</SectionTitle>
        <h3>Filtered Users (by Role)</h3>
        <Table>
          <thead><tr><th>Name</th><th>Email</th><th>Age</th><th>Role</th></tr></thead>
          <tbody>{(data.filteredUsers || []).map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.age}</td><td>{u.role}</td></tr>)}</tbody>
        </Table>
        <PaginationControls>
          <select value={filteredPageSize} onChange={(e) => { setFilteredPageSize(Number(e.target.value)); setFilteredPage(1); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <ReactPaginate
            previousLabel={"← Previous"} nextLabel={"Next →"} breakLabel={"..."} pageCount={filteredTotalPages}
            marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={(selectedItem) => setFilteredPage(selectedItem.selected + 1)}
            containerClassName={"pagination"} activeClassName={"active"} forcePage={filteredPage - 1}
          />
        </PaginationControls>

        <h3>Projected Users</h3>
        <Table>
          <thead><tr><th>User Name</th><th>User Email</th><th>User Age</th><th>User Role</th></tr></thead>
          <tbody>{(data.projectedUsers || []).map(u => <tr key={u._id}><td>{u.userName}</td><td>{u.userEmail}</td><td>{u.userAge}</td><td>{u.userRole}</td></tr>)}</tbody>
        </Table>
        <PaginationControls>
          <select value={projectedPageSize} onChange={(e) => { setProjectedPageSize(Number(e.target.value)); setProjectedPage(1); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <ReactPaginate
            previousLabel={"← Previous"} nextLabel={"Next →"} breakLabel={"..."} pageCount={projectedTotalPages}
            marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={(selectedItem) => setProjectedPage(selectedItem.selected + 1)}
            containerClassName={"pagination"} activeClassName={"active"} forcePage={projectedPage - 1}
          />
        </PaginationControls>

        <h3>Sorted Users (by Age)</h3>
        <List>{(data.sortedUsers || []).map(u => <li key={u._id}>{u.name} - {u.age}</li>)}</List>
        <PaginationControls>
          <select value={sortedPageSize} onChange={(e) => { setSortedPageSize(Number(e.target.value)); setSortedPage(1); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <ReactPaginate
            previousLabel={"← Previous"} nextLabel={"Next →"} breakLabel={"..."} pageCount={sortedTotalPages}
            marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={(selectedItem) => setSortedPage(selectedItem.selected + 1)}
            containerClassName={"pagination"} activeClassName={"active"} forcePage={sortedPage - 1}
          />
        </PaginationControls>

        <h3>Top Users</h3>
        <List>{(data.topUsers || []).map(u => <li key={u._id}>{u.name}</li>)}</List>
        <PaginationControls>
          <select value={topPageSize} onChange={(e) => { setTopPageSize(Number(e.target.value)); setTopPage(1); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <ReactPaginate
            previousLabel={"← Previous"} nextLabel={"Next →"} breakLabel={"..."} pageCount={topTotalPages}
            marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={(selectedItem) => setTopPage(selectedItem.selected + 1)}
            containerClassName={"pagination"} activeClassName={"active"} forcePage={topPage - 1}
          />
        </PaginationControls>

        <h3>Skipped Users</h3>
        <List>{(data.skippedUsers || []).map(u => <li key={u._id}>{u.name}</li>)}</List>
        <PaginationControls>
          <select value={skippedPageSize} onChange={(e) => { setSkippedPageSize(Number(e.target.value)); setSkippedPage(1); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <ReactPaginate
            previousLabel={"← Previous"} nextLabel={"Next →"} breakLabel={"..."} pageCount={skippedTotalPages}
            marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={(selectedItem) => setSkippedPage(selectedItem.selected + 1)}
            containerClassName={"pagination"} activeClassName={"active"} forcePage={skippedPage - 1}
          />
        </PaginationControls>
      </Section>

      {/* LEVEL 2: GROUPING & CALCULATIONS */}
      <Section>
        <SectionTitle>Level 2: Grouping & Calculations</SectionTitle>
        <h3>User Count by Role</h3>
        <ChartContainer>
          <BarChart width={600} height={300} data={countByRoleChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ChartContainer>

        <h3>Total Age by Role</h3>
        <List>{(data.totalAgeByRole || []).map(s => <li key={s._id}>{s._id}: Total {s.totalAge}, Avg {s.averageAge}</li>)}</List>

        <h3>Role Statistics</h3>
        <List>{(data.roleStats || []).map(s => <li key={s._id}>{s._id}: {s.totalUsers} users, Avg Age {s.averageAge}</li>)}</List>
      </Section>
      
      {/* LEVEL 4: ADVANCED STAGES */}
      <Section>
        <SectionTitle>Level 4: Advanced Stages</SectionTitle>
        <h3>Users with Role Details</h3>
        <List>{(data.usersWithDetails || []).map(u => <li key={u._id}>{u.name} - {u.roleDescription}</li>)}</List>

        <h3>Age Distribution</h3>
        <ChartContainer>
          <PieChart width={400} height={400}>
            <Pie data={ageDistChart} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {ageDistChart.map((entry, index) => <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>

        <h3>Dashboard Stats</h3>
        <p>Total Users: {data.dashboardStats?.[0]?.totalUsers?.[0]?.count}</p>
        <List>Users by Role: {(data.dashboardStats?.[0]?.usersByRole || []).map(r => <li key={r._id}>{r._id}: {r.count}</li>)}</List>
      </Section>

      {/* LEVEL 5: PERFORMANCE OPTIMIZATION */}
      <Section>
        <SectionTitle>Level 5: Performance Optimization</SectionTitle>
        <h3>All Users with Disk Use</h3>
        <p>Total: {(data.allWithDisk || []).length} users</p>

        <h3>Complex Stats with Large Data</h3>
        <p>Total Count: {data.complexStats?.[0]?.totalCount?.[0]?.total}</p>

        <h3>Paginated Users</h3>
        <List>{(data.paginatedUsers || []).map(u => <li key={u._id}>{u.name}</li>)}</List>
      </Section>

      {/* Pagination Controls (matching your Users component) */}
      <div style={{ display: "flex", justifyContent: 'space-between', marginTop: '20px' }}>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page
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
          forcePage={page - 1} // Sync with state
        />
      </div>
    </Container>
  );
};

export default AggregationDashboard;