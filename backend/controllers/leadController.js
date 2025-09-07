
// ===== FIXED LEAD CONTROLLER (controllers/leadController.js) =====
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// CREATE LEAD
exports.createLead = async (req, res) => {
  try {
    const { title, status, value, customerId, description } = req.body;

    console.log('Create lead request body:', req.body); // Debug log

    // Basic manual validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Validate status if provided
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Validate value if provided
    if (value !== undefined && (isNaN(value) || value < 0)) {
      return res.status(400).json({ message: 'Value must be a non-negative number' });
    }

    // Verify customer exists and belongs to user
    const customer = await Customer.findOne({
      _id: customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found or access denied' });
    }

    // Create lead with cleaned data
    const leadData = {
      customerId,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'New',
      value: value || 0,
      source: req.body.source || '',
      priority: req.body.priority || 'Medium',
      expectedCloseDate: req.body.expectedCloseDate,
      assignedTo: req.body.assignedTo || '',
      tags: req.body.tags || [],
      notes: req.body.notes || ''
    };

    const lead = new Lead(leadData);
    await lead.save();

    // Populate customer info for response
    await lead.populate('customerId', 'name email company');

    res.status(201).json({ 
      message: 'Lead created successfully', 
      lead 
    });
    
  } catch (error) {
    console.error("Create lead error:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry detected' 
      });
    }

    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// GET LEADS (Updated to handle new fields)
exports.getLeads = async (req, res) => {
  try {
    const { customerId, status, priority } = req.query;
    const query = {};

    if (customerId) {
      // Verify customer belongs to user
      const customer = await Customer.findOne({
        _id: customerId,
        ownerId: req.user._id
      });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found or access denied' });
      }
      query.customerId = customerId;
    } else {
      // If no specific customer, get all customers for this user
      const customerIds = await Customer.find({ ownerId: req.user._id }).distinct('_id');
      query.customerId = { $in: customerIds };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const leads = await Lead.find(query)
      .populate('customerId', 'name email company')
      .sort({ createdAt: -1 });

    res.json({ 
      leads,
      total: leads.length 
    });
    
  } catch (error) {
    console.error("Get leads error:", error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// UPDATE LEAD
exports.updateLead = async (req, res) => {
  try {
    const { title, status, customerId } = req.body;

    console.log('Update lead request body:', req.body); // Debug log

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Validate status if provided
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: customerId,
      ownerId: req.user._id
    });
    if (!customer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clean and validate update data
    const updateData = {
      ...req.body,
      title: title.trim(),
      description: req.body.description ? req.body.description.trim() : lead.description,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email company');

    res.json({ 
      message: 'Lead updated successfully', 
      lead: updatedLead 
    });
    
  } catch (error) {
    console.error("Update lead error:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }

    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// DELETE LEAD (No changes needed)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: lead.customerId,
      ownerId: req.user._id
    });
    if (!customer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
    
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// GET LEAD STATS (Updated for new statuses)
exports.getLeadStats = async (req, res) => {
  try {
    // Get customer IDs that belong to the current user
    const customerIds = await Customer.find({ ownerId: req.user._id }).distinct('_id');
    
    const stats = await Lead.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 }, 
          totalValue: { $sum: '$value' } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate totals
    const totals = await Lead.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' }
        }
      }
    ]);

    res.json({ 
      stats,
      totals: totals[0] || { totalLeads: 0, totalValue: 0, avgValue: 0 }
    });
    
  } catch (error) {
    console.error("Get lead stats error:", error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};