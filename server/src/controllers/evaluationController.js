import { Evaluation } from '../models/Evaluation.js';

// POST /api/evaluations
export async function createEvaluation(req, res, next) {
  try {
    const { seminarCode, score, comment, evaluatedBy } = req.body;

    if (!seminarCode || score === undefined) {
      return res.status(400).json({ message: 'seminarCode and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'score must be between 1 and 5' });
    }

    const evaluation = await Evaluation.create({
      seminarCode,
      score,
      comment,
      evaluatedBy,
    });

    res.status(201).json({ evaluation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User has already evaluated this seminar' });
    }
    next(err);
  }
}

// GET /api/evaluations
export async function getAllEvaluations(req, res, next) {
  try {
    const evaluations = await Evaluation.find().sort({ createdAt: -1 }).lean();
    res.json({ evaluations });
  } catch (err) {
    next(err);
  }
}

// GET /api/evaluations/:id
export async function getEvaluation(req, res, next) {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ evaluation });
  } catch (err) {
    next(err);
  }
}

// GET /api/evaluations/summary?seminarCode=...
export async function getEvaluationSummary(req, res, next) {
  try {
    const { seminarCode } = req.query;

    if (!seminarCode) {
      return res.status(400).json({ message: 'seminarCode is required' });
    }

    const results = await Evaluation.aggregate([
      { $match: { seminarCode } },
      {
        $group: {
          _id: '$seminarCode',
          averageScore: { $avg: '$score' },
          evaluationCount: { $sum: 1 },
        },
      },
    ]);

    if (results.length === 0) {
      return res.json({
        seminarCode,
        averageScore: 0,
        evaluationCount: 0,
      });
    }

    const summary = results[0];
    res.json({
      seminarCode: summary._id,
      averageScore: summary.averageScore,
      evaluationCount: summary.evaluationCount,
    });
  } catch (err) {
    next(err);
  }
}
