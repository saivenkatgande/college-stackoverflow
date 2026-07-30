const app = document.getElementById('app');
const API_URL = 'http://localhost:5000/api';

// Simple SPA Router
const navigateTo = (path) => {
    window.location.hash = path;
    render();
};

const render = () => {
    const path = window.location.hash || '#/';
    const token = localStorage.getItem('token');
    
    // Update Navbar state
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-nav-link');
    const homeLink = document.getElementById('home-link');
    const settingsLink = document.getElementById('settings-nav-link');
    
    if (token) {
        loginLink.textContent = 'Logout';
        registerLink.style.display = 'none';
        settingsLink.style.display = 'inline-block';
    } else {
        loginLink.textContent = 'Login';
        registerLink.style.display = 'inline-block';
        settingsLink.style.display = 'none';
    }
    
    if (path === '#/' || path === '#' || path === '') {
        homeLink.style.display = 'none';
    } else {
        homeLink.style.display = 'inline-block';
    }
    
    // Auth Check routing
    if (path === '#/login') {
        app.innerHTML = renderLogin();
        attachLoginListeners();
    } else if (path === '#/register') {
        app.innerHTML = renderRegister();
        attachRegisterListeners();
    } else if (path === '#/') {
        if (!token) return navigateTo('#/login');
        app.innerHTML = renderDashboard();
        fetchQuestions();
    } else if (path === '#/ask') {
        if (!token) return navigateTo('#/login');
        app.innerHTML = renderAskQuestion();
        attachAskListeners();
    } else if (path === '#/settings') {
        if (!token) return navigateTo('#/login');
        app.innerHTML = renderSettings();
        attachSettingsListeners();
    } else if (path.startsWith('#/question/')) {
        if (!token) return navigateTo('#/login');
        const id = path.split('/')[2];
        renderQuestionDetail(id);
    }
};

// --- UI Components --- //

const renderLogin = () => `
    <div class="glass-panel" style="max-width: 400px; margin: 2rem auto;">
        <h2 style="margin-bottom: 1.5rem; text-align: center;">Welcome Back</h2>
        <form id="login-form">
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="email" class="form-control" required placeholder="student@college.edu">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Log In</button>
        </form>
        <div id="login-message" style="margin-top: 1rem; text-align: center; font-weight: 500;"></div>
        <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem; color: var(--text-secondary);">
            Don't have an account? <a href="#/register" style="color: var(--accent-primary);">Register</a>
        </p>
    </div>
`;

const renderRegister = () => `
    <div class="glass-panel" style="max-width: 400px; margin: 2rem auto;">
        <h2 style="margin-bottom: 1.5rem; text-align: center;">Join College StackOverflow</h2>
        <form id="register-form">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>College Email</label>
                <input type="email" id="email" class="form-control" required placeholder="student@college.edu">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="role" class="form-control">
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
        </form>
        <div id="register-message" style="margin-top: 1rem; text-align: center; font-weight: 500;"></div>
        <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem; color: var(--text-secondary);">
            Already have an account? <a href="#/login" style="color: var(--accent-primary);">Log In</a>
        </p>
    </div>
`;

const renderDashboard = () => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Recent Questions</h2>
        <button class="btn btn-primary" onclick="navigateTo('#/ask')">+ Ask Question</button>
    </div>
    <div id="questions-container">
        <p style="text-align: center; color: var(--text-secondary);">Loading questions...</p>
    </div>
`;

const renderSettings = () => `
    <div class="glass-panel" style="max-width: 400px; margin: 2rem auto;">
        <h2 style="margin-bottom: 1.5rem; text-align: center;">Settings</h2>
        <form id="settings-form">
            <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="old-password" class="form-control" required>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="new-password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Change Password</button>
        </form>
        <div id="settings-message" style="margin-top: 1rem; text-align: center; font-weight: 500;"></div>
    </div>
`;

const attachSettingsListeners = () => {
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        
        const msgDiv = document.getElementById('settings-message');
        msgDiv.textContent = 'Updating...';
        msgDiv.style.color = 'var(--text-secondary)';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            
            if (res.ok) {
                msgDiv.textContent = data.message;
                msgDiv.style.color = 'var(--success)';
                document.getElementById('settings-form').reset();
            } else {
                msgDiv.textContent = data.message;
                msgDiv.style.color = 'var(--danger)';
            }
        } catch (err) {
            msgDiv.textContent = 'Error updating password.';
            msgDiv.style.color = 'var(--danger)';
        }
    });
};

// --- Listeners and API Calls --- //

const attachLoginListeners = () => {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const msgDiv = document.getElementById('login-message');
        msgDiv.textContent = 'Logging in...';
        msgDiv.style.color = 'var(--text-secondary)';

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                msgDiv.textContent = 'Success!';
                msgDiv.style.color = 'var(--accent-primary)';
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => navigateTo('#/'), 500);
            } else {
                msgDiv.textContent = data.message;
                msgDiv.style.color = 'var(--danger)';
            }
        } catch (err) {
            msgDiv.textContent = 'Error logging in. Is the server running?';
            msgDiv.style.color = 'var(--danger)';
        }
    });
};

const attachRegisterListeners = () => {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        const msgDiv = document.getElementById('register-message');
        msgDiv.textContent = 'Registering...';
        msgDiv.style.color = 'var(--text-secondary)';

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            
            if (res.ok) {
                msgDiv.textContent = data.message;
                msgDiv.style.color = 'var(--accent-primary)';
                setTimeout(() => {
                    if (role === 'STUDENT') navigateTo('#/login');
                }, 1500);
            } else {
                msgDiv.textContent = data.message;
                msgDiv.style.color = 'var(--danger)';
            }
        } catch (err) {
            msgDiv.textContent = 'Error registering. Is the server running?';
            msgDiv.style.color = 'var(--danger)';
        }
    });
};

const fetchQuestions = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
            localStorage.removeItem('token');
            return navigateTo('#/login');
        }
        
        const questions = await res.json();
        const container = document.getElementById('questions-container');
        
        if (questions.length === 0) {
            container.innerHTML = '<div class="glass-panel" style="text-align: center;">No questions yet. Be the first to ask!</div>';
            return;
        }
        
        container.innerHTML = questions.map(q => `
            <div class="question-card" onclick="navigateTo('#/question/${q.id}')">
                <div class="question-title">${q.title}</div>
                <div class="question-meta">
                    <span>Asked by ${q.author.name} ${q.author.branch ? '('+q.author.branch+')' : ''}</span>
                    <span>${new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${q.tags.map(t => `<span class="tag">${t.name}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        document.getElementById('questions-container').innerHTML = '<p style="color: var(--danger);">Failed to load questions.</p>';
    }
};

const renderAskQuestion = () => `
    <div class="glass-panel">
        <h2 style="margin-bottom: 1.5rem;">Ask a Question</h2>
        <form id="ask-form">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="q-title" class="form-control" required placeholder="e.g. How does Dijkstra's algorithm work?">
            </div>
            <div class="form-group">
                <label>Details</label>
                <textarea id="q-body" class="form-control" required placeholder="Provide more context..."></textarea>
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" id="q-tags" class="form-control" placeholder="e.g. algorithms, graph-theory">
            </div>
            <button type="submit" class="btn btn-primary">Post Question</button>
            <button type="button" class="btn" onclick="navigateTo('#/')" style="background: var(--bg-secondary); color: white; margin-left: 1rem;">Cancel</button>
        </form>
        <div id="ask-message" style="margin-top: 1rem; font-weight: 500;"></div>
    </div>
`;

const attachAskListeners = () => {
    document.getElementById('ask-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('q-title').value;
        const body = document.getElementById('q-body').value;
        const tagsInput = document.getElementById('q-tags').value;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        
        const msgDiv = document.getElementById('ask-message');
        msgDiv.textContent = 'Posting...';
        msgDiv.style.color = 'var(--text-secondary)';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/questions`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, body, tags })
            });
            
            if (res.ok) {
                navigateTo('#/');
            } else {
                const data = await res.json();
                msgDiv.textContent = data.message || 'Failed to post';
                msgDiv.style.color = 'var(--danger)';
            }
        } catch (err) {
            msgDiv.textContent = 'Error posting question.';
            msgDiv.style.color = 'var(--danger)';
        }
    });
};

const renderQuestionDetail = (id) => {
    app.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading question details...</p>';
    fetchQuestionDetail(id);
};

const fetchQuestionDetail = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/questions/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 404) return app.innerHTML = '<div class="glass-panel">Question not found.</div>';
        
        const q = await res.json();
        const user = JSON.parse(localStorage.getItem('user'));
        
        let html = `
            <div style="margin-bottom: 2rem;">
                <button class="btn" onclick="navigateTo('#/')" style="background: var(--bg-secondary); color: white; margin-bottom: 1rem;">&larr; Back</button>
                <h2>${q.title}</h2>
                <div class="question-meta" style="margin-top: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    <span>Asked by ${q.author.name} ${q.author.branch ? '('+q.author.branch+')' : ''}</span>
                    <span>${new Date(q.createdAt).toLocaleString()}</span>
                </div>
                <div class="question-body">${q.body.replace(/\\n/g, '<br>')}</div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    ${q.tags.map(t => `<span class="tag">${t.name}</span>`).join('')}
                </div>
            </div>
        `;
        
        // Poll Section
        if (q.poll) {
            let totalVotes = 0;
            const userVotedFor = Object.keys(q.poll.votes || {}).find(opt => q.poll.votes[opt].includes(user.id));
            
            for (let opt in q.poll.votes) {
                totalVotes += q.poll.votes[opt].length;
            }
            
            html += `<div class="poll-container">
                <h3 style="margin-bottom: 1rem;">Poll</h3>
            `;
            
            q.poll.options.forEach(opt => {
                const votes = q.poll.votes && q.poll.votes[opt] ? q.poll.votes[opt].length : 0;
                const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
                
                html += `
                    <div class="poll-option" onclick="votePoll('${q.poll.id}', '${opt}', '${q.id}')">
                        <div class="poll-progress" style="width: ${percentage}%"></div>
                        <div class="poll-option-text">
                            ${userVotedFor === opt ? '✅ ' : ''}${opt}
                        </div>
                        <div class="poll-option-votes">${votes} (${percentage}%)</div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // Answers Section
        html += `
            <div style="margin-top: 3rem;">
                <h3>Answers (${q.answers.length})</h3>
                <div style="margin-top: 1.5rem;">
                    ${q.answers.map(a => `
                        <div class="answer-card ${a.isFacultyVerified ? 'verified' : ''}">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                                    <strong>${a.author.name}</strong> ${a.author.role === 'FACULTY' ? '👨‍🏫 (Faculty)' : ''} &bull; ${new Date(a.createdAt).toLocaleString()}
                                </div>
                                ${a.isFacultyVerified ? `<div class="verified-badge">✓ Verified by Faculty</div>` : ''}
                                ${(user.role === 'FACULTY' && !a.isFacultyVerified) ? `<button class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;" onclick="verifyAnswer('${a.id}', '${q.id}')">Verify Answer</button>` : ''}
                            </div>
                            <div class="question-body" style="margin: 0;">${a.body.replace(/\\n/g, '<br>')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="glass-panel" style="margin-top: 2rem;">
                <h4>Your Answer</h4>
                <form onsubmit="submitAnswer(event, '${q.id}')" style="margin-top: 1rem;">
                    <div class="form-group">
                        <textarea id="answer-body" class="form-control" required placeholder="Type your answer here..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Answer</button>
                    <span id="answer-message" style="margin-left: 1rem; font-weight: 500;"></span>
                </form>
            </div>
        `;
        
        app.innerHTML = html;
        
    } catch (err) {
        app.innerHTML = '<p style="color: var(--danger); text-align: center;">Error loading question.</p>';
    }
};

window.submitAnswer = async (e, questionId) => {
    e.preventDefault();
    const body = document.getElementById('answer-body').value;
    const msgDiv = document.getElementById('answer-message');
    msgDiv.textContent = 'Posting...';
    msgDiv.style.color = 'var(--text-secondary)';
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/answers/${questionId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ body })
        });
        
        if (res.ok) {
            renderQuestionDetail(questionId);
        } else {
            msgDiv.textContent = 'Failed to post answer';
            msgDiv.style.color = 'var(--danger)';
        }
    } catch (err) {
        msgDiv.textContent = 'Error posting answer';
        msgDiv.style.color = 'var(--danger)';
    }
};

window.verifyAnswer = async (answerId, questionId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/answers/${answerId}/verify`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            renderQuestionDetail(questionId);
        } else {
            alert('Failed to verify answer');
        }
    } catch (err) {
        alert('Error verifying answer');
    }
};

window.votePoll = async (pollId, option, questionId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ option })
        });
        
        if (res.ok) {
            renderQuestionDetail(questionId);
        }
    } catch (err) {
        console.error('Error voting on poll');
    }
};

// Init
window.addEventListener('hashchange', render);
render();

// Setup Nav
document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('#/');
});
document.getElementById('settings-nav-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('#/settings');
});
document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    if(localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Logged out');
    }
    navigateTo('#/login');
});
document.getElementById('register-nav-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('#/register');
});
