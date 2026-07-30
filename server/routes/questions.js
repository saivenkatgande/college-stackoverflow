const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');

// Get all questions
router.get('/', auth, async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            include: { author: { select: { name: true, branch: true } }, tags: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Ask a question
router.post('/', auth, async (req, res) => {
    try {
        const { title, body, tags } = req.body;
        
        const question = await prisma.question.create({
            data: {
                title,
                body,
                authorId: req.user.id,
                tags: tags && tags.length > 0 ? {
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag }
                    }))
                } : undefined
            },
            include: { tags: true }
        });

        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get question by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const question = await prisma.question.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { name: true, branch: true } },
                tags: true,
                poll: true,
                answers: {
                    include: { author: { select: { name: true, role: true } } },
                    orderBy: { upvotes: 'desc' }
                }
            }
        });

        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
