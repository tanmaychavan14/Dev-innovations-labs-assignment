const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { leadValidator } = require('../utils/validators');

exports.createLead = async (req, res) => {
  try {
    const { error } = leadValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Verify customer exists and belongs to user
    const customer = await Customer.findOne({
      _id: req.body.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const lead = new Lead(req.body);
    await lead.save();

    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { customerId, status } = req.query;
    const query = {};

    if (customerId) {
      // Verify customer belongs to user
      const customer = await Customer.findOne({
        _id: customerId,
        ownerId: req.user._id
      });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      query.customerId = customerId;
    }

    if (status) {
      query.status = status;
    }

    const leads = await Lead.find(query)
      .populate('customerId', 'name email company')
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { error } = leadValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

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

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Lead updated successfully', lead: updatedLead });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeadStats = async (req, res) => {
  try {
    // Get customer IDs that belong to the current user
    const customerIds = await Customer.find({ ownerId: req.user._id }).distinct('_id');
    
    const stats = await Lead.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
    ]);

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};