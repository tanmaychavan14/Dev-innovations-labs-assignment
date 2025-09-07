// components/customers/CustomerDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import LeadForm from './LeadForm';
import LoadingSpinner from '../common/LoadingSpinner';
import './CustomerDetail.css';

const CustomerDetail = () => {
  const { id } = useParams(); // Changed from customerId to id
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch both customer and leads data
      const [customerResponse, leadsResponse] = await Promise.all([
        api.get(`/customers/${id}`), // Using id instead of customerId
        api.get('/leads', { params: { customerId: id } }) // Backend expects customerId in query
      ]);

      console.log('Customer response:', customerResponse.data);
      console.log('Leads response:', leadsResponse.data);

      setCustomer(customerResponse.data.customer || customerResponse.data);
      setLeads(leadsResponse.data.leads || []);
      
    } catch (err) {
      console.error('Fetch data error:', err);
      if (err.response?.status === 404) {
        setError('Customer not found');
      } else {
        setError('Failed to load customer data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setShowLeadForm(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${leadId}`);
        // Refresh only leads, not customer data
        const leadsResponse = await api.get('/leads', { params: { customerId: id } });
        setLeads(leadsResponse.data.leads || []);
      } catch (err) {
        console.error('Delete lead error:', err);
        alert('Failed to delete lead');
      }
    }
  };

  const handleLeadFormSubmit = async () => {
    setShowLeadForm(false);
    setEditingLead(null);
    
    // Refresh only leads data
    try {
      const leadsResponse = await api.get('/leads', { params: { customerId: id } });
      setLeads(leadsResponse.data.leads || []);
    } catch (err) {
      console.error('Refresh leads error:', err);
    }
  };

  const handleLeadFormCancel = () => {
    setShowLeadForm(false);
    setEditingLead(null);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="customer-detail-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="customer-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => fetchAllData()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Show message if no customer found
  if (!customer) {
    return (
      <div className="customer-detail-container">
        <div className="error-message">Customer not found</div>
        <button onClick={() => fetchAllData()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="customer-detail-container">
      <div className="customer-header">
        <div className="customer-info">
          <div className="customer-avatar-large">
            {(customer.name && customer.name.charAt(0).toUpperCase()) || '?'}
          </div>
          <div className="customer-details">
            <h1>{customer.name || 'N/A'}</h1>
            <p className="customer-company">{customer.company || 'N/A'}</p>
            <div className="customer-contact">
              <span>📧 {customer.email || 'N/A'}</span>
              <span>📱 {customer.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleAddLead}
          className="btn btn-primary"
        >
          Add New Lead
        </button>
      </div>

      <div className="leads-section">
        <div className="section-header">
          <h2>Leads ({leads.length})</h2>
        </div>

        {leads.length === 0 ? (
          <div className="empty-state">
            <h3>No leads yet</h3>
            <p>Start by adding a lead for this customer</p>
            <button 
              onClick={handleAddLead}
              className="btn btn-primary"
            >
              Add First Lead
            </button>
          </div>
        ) : (
          <div className="leads-grid">
            {leads.map(lead => (
              <div key={lead._id} className="lead-card">
                <div className="lead-header">
                  <h3>{lead.title || 'Untitled Lead'}</h3>
                  <span className={`status-badge ${(lead.status || 'new').toLowerCase()}`}>
                    {lead.status || 'New'}
                  </span>
                </div>
                <p className="lead-description">{lead.description || 'No description'}</p>
                <div className="lead-meta">
                  <span className="lead-value">
                    ${lead.value ? lead.value.toLocaleString() : '0'}
                  </span>
                  <span className="lead-date">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
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
            ))}
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) {
            handleLeadFormCancel();
          }
        }}>
          <div className="modal-content">
            <LeadForm 
              lead={editingLead}
              customerId={id} // Pass the id as customerId for the LeadForm
              onSubmit={handleLeadFormSubmit}
              onCancel={handleLeadFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail