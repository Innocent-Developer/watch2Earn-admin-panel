const API_BASE_URL = 'https://watch2earn-vie97.ondigitalocean.app/api';
let adminToken = localStorage.getItem('adminToken');

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const sidebar = document.getElementById('sidebar');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const contentArea = document.getElementById('content-area');
const logoutButton = document.getElementById('logout-button');
const messageBox = document.getElementById('message-box');

// New DOM elements for login loader
const loginButton = document.getElementById('login-btn');
const loginButtonText = document.getElementById('login-btn-text');
const loginSpinner = document.getElementById('login-spinner');

/**
 * Toggles the visibility of the sidebar for mobile views.
 */
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

/**
 * Displays a notification message to the user.
 * @param {string} message The message to display.
 */
function showMessage(message) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

/**
 * Authenticates the user and fetches the admin token.
 * @param {Event} e The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Show spinner and disable button
    loginButton.disabled = true;
    loginButtonText.style.display = 'none';
    loginSpinner.style.display = 'inline-block';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            showAdminPanel();
            renderPage('dashboard');
        } else {
            loginError.textContent = data.message || 'Login failed.';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred. Please try again.';
        loginError.style.display = 'block';
    } finally {
        // Hide spinner and re-enable button
        loginButton.disabled = false;
        loginButtonText.style.display = 'inline';
        loginSpinner.style.display = 'none';
    }
}

/**
 * Handles the logout process.
 */
function handleLogout() {
    localStorage.removeItem('adminToken');
    adminToken = null;
    showLoginPage();
}

/**
 * Shows the admin panel and hides the login page.
 */
function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminPanel.style.display = 'flex';
}

/**
 * Shows the login page and hides the admin panel.
 */
function showLoginPage() {
    loginContainer.style.display = 'flex';
    adminPanel.style.display = 'none';
}

/**
 * Renders the specified page content in the main area.
 * @param {string} pageName The name of the page to render.
 */
function renderPage(pageName) {
    // Highlight active sidebar item
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }

    // Clear previous content
    contentArea.innerHTML = '<div class="card"><p>Loading...</p></div>';

    // Render new page content
    switch (pageName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'deposits':
            renderDeposits();
            break;
        case 'withdrawals':
            renderWithdrawals();
            break;
        case 'users':
            renderUsers();
            break;
        case 'create-ad':
            renderCreateAd();
            break;
        default:
            contentArea.innerHTML = '<div class="card"><h3>Page Not Found</h3></div>';
    }
}

/**
 * Renders the admin dashboard with statistics.
 */
async function renderDashboard() {
    contentArea.innerHTML = '<h3>Dashboard</h3><div class="card stats-grid" id="stats-grid"></div>';
    const statsGrid = document.getElementById('stats-grid');
    
    try {
        const [depositStatsRes, withdrawalStatsRes, userStatsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/deposits/stats`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }),
            fetch(`${API_BASE_URL}/admin/withdrawals/stats`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }),
            fetch(`${API_BASE_URL}/admin/users/search`, { // Fetch all users to get total count
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
        ]);

        const depositStats = await depositStatsRes.json();
        const withdrawalStats = await withdrawalStatsRes.json();
        const userStats = await userStatsRes.json();
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="value">${depositStats.data.totalDeposits || '0'}</div>
                <div class="label">Total Deposits</div>
            </div>
            <div class="stat-card">
                <div class="value">$${(depositStats.data.totalAmount || 0).toFixed(2)}</div>
                <div class="label">Total Deposit Amount</div>
            </div>
            <div class="stat-card">
                <div class="value">${withdrawalStats.data.totalWithdrawals || '0'}</div>
                <div class="label">Total Withdrawals</div>
            </div>
            <div class="stat-card">
                <div class="value">$${(withdrawalStats.data.totalAmount || 0).toFixed(2)}</div>
                <div class="label">Total Withdrawal Amount</div>
            </div>
            <div class="stat-card">
                <div class="value">${userStats.data.pagination.totalUsers || '0'}</div>
                <div class="label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="value">N/A</div>
                <div class="label">Total Ads</div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        statsGrid.innerHTML = '<p class="error-message">Failed to load statistics.</p>';
    }
}

/**
 * Renders the deposits page with a list of pending deposits.
 */
async function renderDeposits() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Deposit Requests</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Deposit ID</th>
                            <th>User UID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="deposits-table-body">
                        <tr><td colspan="5">Loading deposits...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const depositsTableBody = document.getElementById('deposits-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/deposits`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        const deposits = data.data.deposits; 
        
        depositsTableBody.innerHTML = deposits.map(deposit => `
            <tr>
                <td>${deposit._id}</td>
                <td>${deposit.uid}</td>
                <td>$${deposit.amount}</td>
                <td><span class="badge ${deposit.status.toLowerCase()}">${deposit.status}</span></td>
                <td>
                    ${deposit.status === 'pending' ? `<button class="btn-approve" onclick="approveDeposit('${deposit._id}')">Approve</button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch deposits:', error);
        depositsTableBody.innerHTML = `<tr><td colspan="5">Failed to load deposits.</td></tr>`;
    }
}

/**
 * Approves a deposit request.
 * @param {string} depositId The ID of the deposit to approve.
 */
async function approveDeposit(depositId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/deposit/approve/${depositId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showMessage('Deposit approved successfully!');
            renderPage('deposits'); // Reload the page to show the update
        } else {
            const error = await response.json();
            showMessage(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Failed to approve deposit:', error);
        showMessage('Failed to approve deposit.');
    }
}

/**
 * Renders the withdrawals page with a list of pending withdrawal requests.
 */
async function renderWithdrawals() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Withdrawal Requests</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>User UID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="withdrawals-table-body">
                        <tr><td colspan="5">Loading withdrawals...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        const withdrawals = data.data.withdrawals;
        
        withdrawalsTableBody.innerHTML = withdrawals.map(withdrawal => `
            <tr>
                <td>${withdrawal._id}</td>
                <td>${withdrawal.user.uid}</td>
                <td>$${withdrawal.amount}</td>
                <td><span class="badge ${withdrawal.status.toLowerCase()}">${withdrawal.status}</span></td>
                <td>
                    ${withdrawal.status === 'pending' ? `<button class="btn-approve" onclick="approveWithdrawal('${withdrawal._id}')">Approve</button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
        withdrawalsTableBody.innerHTML = `<tr><td colspan="5">Failed to load withdrawals.</td></tr>`;
    }
}

/**
 * Approves a withdrawal request.
 * @param {string} requestId The ID of the withdrawal request to approve.
 */
async function approveWithdrawal(requestId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawal/approve/${requestId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showMessage('Withdrawal approved successfully!');
            renderPage('withdrawals'); // Reload the page to show the update
        } else {
            const error = await response.json();
            showMessage(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Failed to approve withdrawal:', error);
        showMessage('Failed to approve withdrawal.');
    }
}

/**
 * Renders the users page with a search functionality.
 */
async function renderUsers() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Search Users</h3>
            <form id="user-search-form" class="form-container">
                <input type="text" id="search-value" placeholder="Enter User UID, Name, Email, or Phone">
                <button type="submit">Search</button>
            </form>
        </div>
        <div id="user-search-results"></div>
    `;

    const userSearchForm = document.getElementById('user-search-form');
    userSearchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchValue = document.getElementById('search-value').value;
        const searchResultsDiv = document.getElementById('user-search-results');
        searchResultsDiv.innerHTML = '<p class="card">Searching...</p>';

        try {
            const isUid = !isNaN(Number(searchValue)) && searchValue.length > 0;
            const url = isUid
                ? `${API_BASE_URL}/admin/user/${searchValue}`
                : `${API_BASE_URL}/admin/users/search?search=${searchValue}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                const user = isUid ? data.data.user : data.data.users[0]; // Assuming only one user matches for simplicity
                if (user) {
                    searchResultsDiv.innerHTML = `
                        <div class="card">
                            <h3>User Details</h3>
                            <p><strong>UID:</strong> ${user.uid}</p>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Phone:</strong> ${user.phoneNumber}</p>
                            <p><strong>Balance:</strong> $${(user.totalBalance || 0).toFixed(2)}</p>
                            <p><strong>Plan:</strong> ${user.plan}</p>
                            <p><strong>Level:</strong> ${user.level}</p>
                            <button class="btn-approve mt-4" onclick="viewTeam('${user.referralCode}')">View Team</button>
                        </div>
                    `;
                } else {
                     searchResultsDiv.innerHTML = '<p class="card">No user found with that UID or email.</p>';
                }
            } else {
                searchResultsDiv.innerHTML = `<p class="card">Error: ${data.message}</p>`;
            }
        } catch (error) {
            console.error('User search error:', error);
            searchResultsDiv.innerHTML = '<p class="card">An error occurred during search.</p>';
        }
    });
}

/**
 * Views a user's team by referral code.
 * @param {string} referralCode The referral code of the user.
 */
async function viewTeam(referralCode) {
    const teamContainer = document.getElementById('user-search-results');
    teamContainer.innerHTML = '<p class="card">Loading team data...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/team/${referralCode}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        const team = data.data.users;
        
        if (response.ok && data.success && team && team.length > 0) {
            teamContainer.innerHTML = `
                <div class="card">
                    <h3>Team for ${referralCode}</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Member UID</th>
                                <th>Level</th>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${team.map(member => `
                                <tr>
                                    <td>${member.uid}</td>
                                    <td>${member.level}</td>
                                    <td>${member.name}</td>
                                    <td>${member.email}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            teamContainer.innerHTML = '<p class="card">No team members found.</p>';
        }
    } catch (error) {
        console.error('Failed to fetch team:', error);
        teamContainer.innerHTML = '<p class="card">Failed to load team data.</p>';
    }
}

/**
 * Renders the create ad form page.
 */
function renderCreateAd() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Create New Ad</h3>
            <form id="create-ad-form" class="form-container">
                <input type="text" id="ad-name" placeholder="Ad Name" required>
                <input type="url" id="ad-video-url" placeholder="Ad Video URL (optional)">
                <input type="url" id="ad-image-url" placeholder="Ad Image URL (optional)">
                <input type="url" id="ad-link" placeholder="Ad Link" required>
                <input type="number" id="ad-duration" step="1" placeholder="Duration in seconds" required>
                <button type="submit">Create Ad</button>
            </form>
        </div>
    `;
    
    const createAdForm = document.getElementById('create-ad-form');
    createAdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('ad-name').value;
        const videoUrl = document.getElementById('ad-video-url').value;
        const imageUrl = document.getElementById('ad-image-url').value;
        const link = document.getElementById('ad-link').value;
        const duration = parseInt(document.getElementById('ad-duration').value);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/create-ad`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, videoUrl, imageUrl, link, duration })
            });
            
            const data = await response.json();
            if (response.ok) {
                showMessage('Ad created successfully!');
                createAdForm.reset();
            } else {
                showMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Failed to create ad:', error);
            showMessage('Failed to create ad.');
        }
    });
}

// ====================================================================================================
// Event Listeners and Initialization
// ====================================================================================================

// Attach login handler
loginForm.addEventListener('submit', handleLogin);

// Attach logout handler
logoutButton.addEventListener('click', handleLogout);

// Attach navigation handlers
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageName = item.dataset.page;
        if (pageName) {
            renderPage(pageName);
        }
    });
});

// Check for existing token on page load
document.addEventListener('DOMContentLoaded', () => {
    if (adminToken) {
        showAdminPanel();
        renderPage('dashboard');
    } else {
        showLoginPage();
    }
});
