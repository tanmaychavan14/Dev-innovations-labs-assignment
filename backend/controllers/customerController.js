const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

// CREATE CUSTOMER
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Basic manual validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const customer = new Customer({
      ...req.body,
      ownerId: req.user._id
    });

    await customer.save();
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL CUSTOMERS
exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      ownerId: req.user._id,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const customers = await Customer.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET CUSTOMER BY ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const leads = await Lead.find({ customerId: customer._id });

    res.json({ customer, leads });
  } catch (error) {
    console.error("Get customer by ID error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Optional basic validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Delete associated leads
    await Lead.deleteMany({ customerId: req.params.id });

    res.json({ message: 'Customer and associated leads deleted successfully' });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
