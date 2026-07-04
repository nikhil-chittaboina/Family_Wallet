import express from 'express';
import Loan from '../models/Loan.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const loans = await Loan.find().sort({ dueDate: 1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load loans' });
  }
});

router.post('/', async (req, res) => {
  try {
    const loan = new Loan(req.body);
    const saved = await loan.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load loan' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await Loan.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete loan' });
  }
});

export default router;
