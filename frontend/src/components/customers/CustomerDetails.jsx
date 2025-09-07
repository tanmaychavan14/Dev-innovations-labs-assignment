// components/customers/CustomerDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import LeadForm from './LeadForm';
import './Customer.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer details
      const customerResponse = await api.get(`/customers/${id}`);
      setCustomer(customerResponse.data);
      
      // Fetch customer's leads
      const leadsResponse = await api.get(`/leads?customerId=${id}`);
      setLeads(leadsResponse.data.leads || []);
      
    } catch (err) {
      console.error('Fetch customer data error:', err);
      if (err.response?.status === 404) {
        setError('Customer not found');
      } else {
        setError('Failed to load customer data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${leadId}`);
        setLeads(leads.filter(lead => lead._id !== leadId));
      } catch (err) {
        console.error('Delete lead error:', err);
        alert('Failed to delete lead');
      }
    }
  };

  const handleLeadFormSubmit = () => {
    setShowLeadForm(false);
    setEditingLead(null);
    fetchCustomerData();
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'Contacted': return '#f59e0b';
      case 'Converted': return '#10b981';
      case 'Lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredLeads = statusFilter === 'All' 
    ? leads 
    : leads.filter(lead => lead.status === statusFilter);

  const leadStats = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    acc.totalValue += lead.value || 0;
    return acc;
  }, { totalValue: 0 });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <Link to="/customers" className="btn btn-primary">
          Back to Customers
        </Link>
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="customer-detail">
      {/* Customer Header */}
      <div className="customer-header">
        <Link to="/customers" className="back-link">
          ← Back to Customers
        </Link>
        
        <div className="customer-info-header">
          <div className="customer-avatar-large">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="customer-details">
            <h1>{customer.name}</h1>
            <p className="customer-email">{customer.email}</p>
            <div className="customer-meta">
              {customer.phone && <span>📞 {customer.phone}</span>}
              {customer.company && <span>🏢 {customer.company}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Stats */}
      <div className="lead-stats">
        <div className="stat-card">
          <h3>{leads.length}</h3>
          <p>Total Leads</p>
        </div>
        <div className="stat-card">
          <h3>${leadStats.totalValue.toLocaleString()}</h3>
          <p>Total Value</p>
        </div>
        <div className="stat-card">
          <h3>{leadStats.Converted || 0}</h3>
          <p>Converted</p>
        </div>
        <div className="stat-card">
          <h3>{leadStats.New || 0}</h3>
          <p>New Leads</p>
        </div>
      </div>

      {/* Leads Section */}
      <div className="leads-section">
        <div className="leads-header">
          <h2>Leads</h2>
          <div className="leads-controls">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
            <button 
              onClick={() => setShowLeadForm(true)}
              className="btn btn-primary"
            >
              Add Lead
            </button>
          </div>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="leads-grid">
            {filteredLeads.map(lead => (
              <div key={lead._id} className="lead-card">
                <div className="lead-header">
                  <h3>{lead.title}</h3>
                  <div className="lead-actions">
                    <button 
                      onClick={() => handleEditLead(lead)}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteLead(lead._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="lead-description">{lead.description}</p>
                
                <div className="lead-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(lead.status) }}
                  >
                    {lead.status}
                  </span>
                  <span className="lead-value">${lead.value?.toLocaleString()}</span>
                </div>
                
                <div className="lead-date">
                  Created: {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>
              {statusFilter === 'All' 
                ? 'No leads yet' 
                : `No ${statusFilter.toLowerCase()} leads`
              }
            </h3>
            <p>
              {statusFilter === 'All'
                ? 'Add the first lead for this customer'
                : 'Try changing the status filter or add a new lead'
              }
            </p>
            {statusFilter === 'All' && (
              <button 
                onClick={() => setShowLeadForm(true)}
                className="btn btn-primary"
              >
                Add First Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <LeadForm 
              lead={editingLead}
              customerId={customer._id}
              onSubmit={handleLeadFormSubmit}
              onCancel={() => {
                setShowLeadForm(false);
                setEditingLead(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;