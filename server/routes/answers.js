const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { auth, authorize } = require('../middleware/auth');

// Answer a question
router.post('/:questionId', auth, async (req, res) => {
    try {
        const { body } = req.body;
        const answer = await prisma.answer.create({
            data: {
                body,
                questionId: req.params.questionId,
                authorId: req.user.id
            },
            include: { author: { select: { name: true, role: true } } }
        });
        res.status(201).json(answer);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Faculty Verify Answer
router.patch('/:id/verify', auth, authorize('FACULTY', 'ADMIN'), async (req, res) => {
    try {
        const answer = await prisma.answer.update({
            where: { id: req.params.id },
            data: { isFacultyVerified: true }
        });
        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
