export default function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>

      <div className="kpi-row">
        <div className="kpi-card">Users<br />* new users</div>
        <div className="kpi-card">Clicks<br />* number of page views</div>
        <div className="kpi-card">Sales<br />* number of new orders</div>
      </div>

      <div className="charts-placeholder">
        <div className="chart-box">Line Chart</div>
        <div className="chart-box">Pie Chart</div>
        <div className="chart-box">Bar Chart</div>
      </div>
    </div>
  );
}
