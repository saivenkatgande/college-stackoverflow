const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');

// Vote on a poll
router.post('/:id/vote', auth, async (req, res) => {
    try {
        const { option } = req.body;
        const poll = await prisma.poll.findUnique({ where: { id: req.params.id } });
        
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        
        // Check if option is valid
        if (!poll.options.includes(option)) {
            return res.status(400).json({ message: 'Invalid option' });
        }
        
        let votes = (typeof poll.votes === 'object' && poll.votes !== null) ? poll.votes : {};
        
        // Remove previous vote from this user if they already voted
        for (let key in votes) {
            if (Array.isArray(votes[key])) {
                votes[key] = votes[key].filter(userId => userId !== req.user.id);
            }
        }
        
        // Add new vote
        if (!Array.isArray(votes[option])) {
            votes[option] = [];
        }
        votes[option].push(req.user.id);
        
        const updatedPoll = await prisma.poll.update({
            where: { id: req.params.id },
            data: { votes }
        });
        
        res.json(updatedPoll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
