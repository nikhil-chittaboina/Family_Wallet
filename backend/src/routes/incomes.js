import express from 'express';
import Income from '../models/Income.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load incomes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const income = new Income(req.body);
    const saved = await income.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ error: 'Income entry not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load income entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: 'Income entry not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await Income.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Income entry not found' });
    }
    res.json({ message: 'Income entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete income entry' });
  }
});

export default router;
