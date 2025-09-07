
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLeads: 0,
    totalValue: 0,
    avgValue: 0,
    leadStats: {}
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customersResponse = await api.get('/customers?limit=5');
      const customers = customersResponse.data.customers || [];
      console.log('Customers response:', customersResponse.data);
      setRecentCustomers(customers);
      
      // Fetch leads and stats
      const leadsResponse = await api.get('/leads?limit=5');
      const leads = leadsResponse.data.leads || [];
      setRecentLeads(leads);
      
      // Fetch lead stats
      const statsResponse = await api.get('/leads/stats');
      const leadStatsData = statsResponse.data;
      
      console.log('Lead stats response:', leadStatsData);
      
      // Process the stats data properly
      const processedLeadStats = {};
      if (leadStatsData.stats && Array.isArray(leadStatsData.stats)) {
        leadStatsData.stats.forEach(stat => {
          processedLeadStats[stat._id] = stat.count;
        });
      }
      
      setStats({
        totalCustomers: customersResponse.data.pagination?.total || customers.length || 0,
        totalLeads: leadStatsData.totals?.totalLeads || 0,
        totalValue: leadStatsData.totals?.totalValue || 0,
        avgValue: leadStatsData.totals?.avgValue || 0,
        leadStats: processedLeadStats
      });
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your CRM overview</p>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalLeads}</h3>
            <p>Total Leads</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalValue.toLocaleString()}</h3>
            <p>Total Value</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>${stats.avgValue.toFixed(2)}</h3>
            <p>Average Value</p>
          </div>
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="dashboard-section">
        <h2>Lead Status Distribution</h2>
        <div className="lead-status-cards">
          {Object.entries(stats.leadStats).length > 0 ? (
            Object.entries(stats.leadStats).map(([status, count]) => (
              <div key={status} className={`status-card status-${status.toLowerCase()}`}>
                <h4>{count}</h4>
                <p>{status}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No lead statistics available</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Customers */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Customers</h2>
            <Link to="/customers" className="view-all-link">View All</Link>
          </div>
          
          {recentCustomers.length > 0 ? (
            <div className="customer-list">
              {recentCustomers.map(customer => (
                <div key={customer._id} className="customer-item">
                  <div className="customer-avatar">
                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="customer-info">
                    <h4>{customer.name || 'N/A'}</h4>
                    <p>{customer.email || 'N/A'}</p>
                    <span className="customer-company">{customer.company || 'N/A'}</span>
                  </div>
                  <Link to={`/customers/${customer._id}`} className="btn btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No customers yet</p>
              <Link to="/customers" className="btn btn-primary">
                Add First Customer
              </Link>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Leads</h2>
          </div>
          
          {recentLeads.length > 0 ? (
            <div className="lead-list">
              {recentLeads.map(lead => (
                <div key={lead._id} className="lead-item">
                  <div className="lead-info">
                    <h4>{lead.title || 'Untitled Lead'}</h4>
                    <p>{lead.description || 'No description'}</p>
                    <div className="lead-meta">
                      <span className={`status-badge status-${(lead.status || 'new').toLowerCase()}`}>
                        {lead.status || 'New'}
                      </span>
                      <span className="lead-value">${(lead.value || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No leads yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;