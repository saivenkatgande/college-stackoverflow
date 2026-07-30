const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, branch } = req.body;

        // Domain restriction check (we are currently just ensuring it's an email for MVP)
        // In real app, uncomment: if (!email.endsWith('@college.edu')) return error;

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Auto-approve if student, else false for faculty (to be approved manually)
        const isApproved = role === 'FACULTY' ? false : true;

        user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || 'STUDENT',
                branch,
                isApproved
            }
        });

        res.status(201).json({ message: 'User registered successfully. ' + (isApproved ? 'You can now log in.' : 'Pending admin approval.') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isApproved) return res.status(403).json({ message: 'Account pending admin approval' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/change-password', require('../middleware/auth').auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash }
        });
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
