const express = require('express');
const auth = require('../middleware/auth');
const {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  getLeadStats
} = require('../controllers/leadController');

const router = express.Router();

router.use(auth); // All lead routes require authentication

router.post('/', createLead);
router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;