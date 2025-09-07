// components/customers/LeadForm.js
import React, { useState } from 'react';
import { api } from '../../services/api';

const LeadForm = ({ lead, customerId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: lead?.title || '',
    description: lead?.description || '',
    status: lead?.status || 'New',
    value: lead?.value || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = ['New', 'Contacted', 'Converted', 'Lost'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const leadData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        customerId
      };

      if (lead) {
        // Update existing lead
        await api.put(`/leads/${lead._id}`, leadData);
      } else {
        // Create new lead
        await api.post('/leads', leadData);
      }
      onSubmit();
    } catch (err) {
      console.error('Lead form error:', err);
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lead-form">
      <h2>{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Lead Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter lead title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter lead description"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="value">Value ($)</label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (lead ? 'Update Lead' : 'Add Lead')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;