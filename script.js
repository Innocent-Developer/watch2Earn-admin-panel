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
        case 'all-users':
            renderAllUsers();
            break;
        case 'create-ad':
            renderCreateAd();
            break;
        case 'add-admin-account':
            renderAddAdminAccount();
            break;
        case 'view-admin-accounts':
            renderAdminAccounts();
            break;
        case 'all-ads':
            renderAllAds();
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

    // Initialize default values
    let totalDeposits = '0';
    let totalDepositAmount = 0;
    let totalWithdrawals = '0';
    let totalWithdrawalAmount = 0;
    let totalUsers = '0';

    try {
        // Try to fetch deposit stats
        try {
            const depositStatsRes = await fetch(`${API_BASE_URL}/admin/deposits/stats`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const depositStats = await depositStatsRes.json();
            console.log('Deposit Stats Response:', depositStats);

            totalDeposits = depositStats?.data?.totalDeposits ||
                depositStats?.totalDeposits ||
                depositStats?.data?.deposits?.length ||
                '0';

            totalDepositAmount = depositStats?.data?.totalAmount ||
                depositStats?.totalAmount ||
                depositStats?.data?.amount ||
                0;
        } catch (error) {
            console.error('Failed to fetch deposit stats:', error);
        }

        // Try to fetch withdrawal stats
        try {
            const withdrawalStatsRes = await fetch(`${API_BASE_URL}/admin/withdrawals/stats`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const withdrawalStats = await withdrawalStatsRes.json();
            console.log('Withdrawal Stats Response:', withdrawalStats);

            totalWithdrawals = withdrawalStats?.data?.totalWithdrawals ||
                withdrawalStats?.totalWithdrawals ||
                withdrawalStats?.data?.withdrawals?.length ||
                '0';

            totalWithdrawalAmount = withdrawalStats?.data?.totalAmount ||
                withdrawalStats?.totalAmount ||
                withdrawalStats?.data?.amount ||
                0;
        } catch (error) {
            console.error('Failed to fetch withdrawal stats:', error);
        }

        // Try to fetch user stats
        try {
            const userStatsRes = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const userStats = await userStatsRes.json();
            console.log('User Stats Response:', userStats);

            totalUsers = userStats?.data?.users?.length ||
                userStats?.users?.length ||
                userStats?.data?.totalUsers ||
                userStats?.totalUsers ||
                '0';
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }

        // Try to fetch ads stats
        let totalAds = '0';
        try {
            const adsRes = await fetch(`${API_BASE_URL}/ads`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const adsData = await adsRes.json();
            console.log('Ads Response:', adsData);

            totalAds = adsData?.data?.ads?.length ||
                adsData?.ads?.length ||
                adsData?.data?.totalAds ||
                adsData?.totalAds ||
                '0';
        } catch (error) {
            console.error('Failed to fetch ads stats:', error);
        }

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="value">${totalDeposits}</div>
                <div class="label">Total Deposits</div>
            </div>
            <div class="stat-card">
                <div class="value">RS  ${parseFloat(totalDepositAmount).toFixed(2)}</div>
                <div class="label">Total Deposit Amount</div>
            </div>
            <div class="stat-card">
                <div class="value">${totalWithdrawals}</div>
                <div class="label">Total Withdrawals</div>
            </div>
            <div class="stat-card">
                        <div class="value">RS  ${parseFloat(totalWithdrawalAmount).toFixed(2)}</div>
                <div class="label">Total Withdrawal Amount</div>
            </div>
            <div class="stat-card">
                <div class="value">${totalUsers}</div>
                <div class="label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="value">${totalAds}</div>
                <div class="label">Total Ads</div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        statsGrid.innerHTML = `
            <div class="error-message">
                <p>Failed to load statistics.</p>
                <p>Error: ${error.message}</p>
                <button onclick="renderDashboard()" class="btn-approve">Retry</button>
            </div>
        `;
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
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>User UID</th>
                                <th>Amount</th>
                                <th>Bank</th>
                                <th>Sender Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="deposits-table-body">
                            <tr><td colspan="7">Loading deposits...</td></tr>
                        </tbody>
                    </table>
                </div>
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
                <td data-label="Transaction ID">${deposit.transactionId || 'N/A'}</td>
                <td data-label="User UID">${deposit.uid || deposit.user?.uid || 'N/A'}</td>
                <td data-label="Amount">RS ${deposit.amount}</td>
                <td data-label="Bank">${deposit.bankName || 'N/A'}</td>
                <td data-label="Sender Name">${deposit.senderName || 'N/A'}</td>
                <td data-label="Status"><span class="badge ${deposit.status.toLowerCase()}">${deposit.status}</span></td>
                <td data-label="Action">
                    <div class="action-buttons">
                        <button class="btn-approve btn-small" onclick="viewDepositDetails('${deposit._id}')">
                            <i class="fas fa-eye"></i>
                            <span class="btn-text">View</span>
                        </button>
                        ${deposit.status === 'pending' ? `<button class="btn-approve btn-small" onclick="approveDeposit('${deposit._id}')">
                            <i class="fas fa-check"></i>
                            <span class="btn-text">Approve</span>
                        </button>` : '<span class="no-action">No action needed</span>'}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch deposits:', error);
        depositsTableBody.innerHTML = `<tr><td colspan="7" class="error-data">Failed to load deposits.</td></tr>`;
    }
}

/**
 * Approves a deposit request.
 * @param {string} depositId The deposit ID to approve.
 */
async function approveDeposit(depositId) {
    if (!confirm('Are you sure you want to approve this deposit?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/deposit/approve/${depositId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Deposit approved successfully!');
            renderPage('deposits'); // Reload the page
        } else {
            showMessage(`Error: ${data.message || 'Failed to approve deposit.'}`);
        }
    } catch (error) {
        console.error('Failed to approve deposit:', error);
        showMessage('Failed to approve deposit.');
    }
}

/**
 * Views detailed information for a specific deposit.
 * @param {string} depositId The deposit ID to view details for.
 */
async function viewDepositDetails(depositId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/deposits`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        const deposit = data.data.deposits.find(d => d._id === depositId);

        if (deposit) {
            contentArea.innerHTML = `
                <div class="card">
                    <div class="detail-header">
                        <h3>Deposit Details</h3>
                        <button class="btn-approve" onclick="renderPage('deposits')">
                            <i class="fas fa-arrow-left"></i> Back to Deposits
                        </button>
                    </div>
                    <div class="detail-content">
                        <div class="detail-section">
                            <h4>Transaction Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Deposit ID:</strong>
                                    <span>${deposit._id}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Transaction ID:</strong>
                                    <span>${deposit.transactionId || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Amount:</strong>
                                    <span>RS ${deposit.amount}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Bank Name:</strong>
                                    <span>${deposit.bankName || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Sender Name:</strong>
                                    <span>${deposit.senderName || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Sender Phone:</strong>
                                    <span>${deposit.senderPhone || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong>
                                    <span class="badge ${deposit.status.toLowerCase()}">${deposit.status}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Created At:</strong>
                                    <span>${new Date(deposit.createdAt).toLocaleString()}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Updated At:</strong>
                                    <span>${new Date(deposit.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${deposit.pic ? `
                        <div class="detail-section">
                            <h4>Payment Proof</h4>
                            <div class="payment-proof-container">
                                <img src="${deposit.pic}" alt="Payment Proof" style="max-width: 100%; max-height: 400px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;" onclick="window.open('${deposit.pic}', '_blank')">
                                <p style="margin-top: 10px; font-size: 14px; color: #666;">Click image to view full size</p>
                            </div>
                        </div>
                        ` : ''}
                        

                        
                        ${deposit.user ? `
                        <div class="detail-section">
                            <h4>User Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>User ID:</strong>
                                    <span>${deposit.user._id}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>User UID:</strong>
                                    <span>${deposit.user.uid}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Name:</strong>
                                    <span>${deposit.user.name}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Phone Number:</strong>
                                    <span>${deposit.user.phoneNumber}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Plan:</strong>
                                    <span>${deposit.user.plan}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total Balance:</strong>
                                    <span>$${deposit.user.totalBalance}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total Withdrawals:</strong>
                                    <span>$${deposit.user.totalWithdrawals}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Level:</strong>
                                    <span>${deposit.user.level}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${deposit.status === 'pending' ? `
                        <div class="detail-actions">
                            <button class="btn-approve" onclick="approveDeposit('${deposit._id}')">
                                <i class="fas fa-check"></i>
                                Approve Deposit
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            showMessage('Deposit not found.');
        }
    } catch (error) {
        console.error('Failed to fetch deposit details:', error);
        showMessage('Failed to fetch deposit details.');
    }
}

/**
 * Renders the withdrawals page with a list of withdrawal requests.
 */
async function renderWithdrawals() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Withdrawal Requests</h3>
            <div class="table-container">
                <div class="table-responsive">
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
        </div>
    `;
    const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        console.log('Withdrawals API Response:', data);

        // Handle different possible response structures
        let withdrawals = [];
        if (data.success && data.data && data.data.withdrawals) {
            withdrawals = data.data.withdrawals;
        } else if (data.data && Array.isArray(data.data)) {
            withdrawals = data.data;
        } else if (Array.isArray(data)) {
            withdrawals = data;
        } else if (data.withdrawals && Array.isArray(data.withdrawals)) {
            withdrawals = data.withdrawals;
        }

        if (withdrawals && withdrawals.length > 0) {
            withdrawalsTableBody.innerHTML = withdrawals.map(withdrawal => {
                // Handle different user data structures
                const userUid = withdrawal.user?.uid || withdrawal.uid || withdrawal.userId || 'N/A';

                return `
                    <tr>
                        <td data-label="Request ID">${withdrawal._id}</td>
                        <td data-label="User UID">${userUid}</td>
                        <td data-label="Amount">$${withdrawal.amount}</td>
                        <td data-label="Status"><span class="badge ${withdrawal.status.toLowerCase()}">${withdrawal.status}</span></td>
                        <td data-label="Action">
                            <div class="action-buttons">
                                <button class="btn-approve btn-small" onclick="viewWithdrawalDetails('${withdrawal._id}')">
                                    <i class="fas fa-eye"></i>
                                    <span class="btn-text">View</span>
                                </button>
                                ${withdrawal.status === 'pending' ? `<button class="btn-approve btn-small" onclick="approveWithdrawal('${withdrawal._id}')">
                                    <i class="fas fa-check"></i>
                                    <span class="btn-text">Approve</span>
                                </button>` : '<span class="no-action">No action needed</span>'}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            withdrawalsTableBody.innerHTML = '<tr><td colspan="5" class="no-data">No withdrawal requests found.</td></tr>';
        }
    } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
        withdrawalsTableBody.innerHTML = `<tr><td colspan="5" class="error-data">Failed to load withdrawals. Error: ${error.message}</td></tr>`;
    }
}

/**
 * Views detailed information for a specific withdrawal.
 * @param {string} withdrawalId The ID of the withdrawal to view.
 */
async function viewWithdrawalDetails(withdrawalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        let withdrawals = [];
        if (data.success && data.data && data.data.withdrawals) {
            withdrawals = data.data.withdrawals;
        } else if (data.data && Array.isArray(data.data)) {
            withdrawals = data.data;
        } else if (Array.isArray(data)) {
            withdrawals = data;
        } else if (data.withdrawals && Array.isArray(data.withdrawals)) {
            withdrawals = data.withdrawals;
        }

        const withdrawal = withdrawals.find(w => w._id === withdrawalId);

        if (withdrawal) {
            contentArea.innerHTML = `
                <div class="card">
                    <div class="detail-header">
                        <h3>Withdrawal Details</h3>
                        <button class="btn-approve" onclick="renderPage('withdrawals')">
                            <i class="fas fa-arrow-left"></i> Back to Withdrawals
                        </button>
                    </div>
                    <div class="detail-content">
                        <div class="detail-section">
                            <h4>Transaction Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Request ID:</strong>
                                    <span>${withdrawal._id}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Amount:</strong>
                                    <span>$${withdrawal.amount}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Payment Method:</strong>
                                    <span>${withdrawal.paymentMethod || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong>
                                    <span class="badge ${withdrawal.status.toLowerCase()}">${withdrawal.status}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Created At:</strong>
                                    <span>${new Date(withdrawal.createdAt).toLocaleString()}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Updated At:</strong>
                                    <span>${new Date(withdrawal.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${withdrawal.bankName ? `
                        <div class="detail-section">
                            <h4>Bank Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Bank Name:</strong>
                                    <span>${withdrawal.bankName || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Account Holder Name:</strong>
                                    <span>${withdrawal.accountHolderName || 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Account Number:</strong>
                                    <span>${withdrawal.accountNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${withdrawal.user ? `
                        <div class="detail-section">
                            <h4>User Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>User ID:</strong>
                                    <span>${withdrawal.user._id}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>User UID:</strong>
                                    <span>${withdrawal.user.uid}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Name:</strong>
                                    <span>${withdrawal.user.name}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Phone Number:</strong>
                                    <span>${withdrawal.user.phoneNumber}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Plan:</strong>
                                    <span>${withdrawal.user.plan}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total Balance:</strong>
                                    <span>$${withdrawal.user.totalBalance}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total Withdrawals:</strong>
                                    <span>$${withdrawal.user.totalWithdrawals}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Level:</strong>
                                    <span>${withdrawal.user.level}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${withdrawal.status === 'pending' ? `
                        <div class="detail-actions">
                            <button class="btn-approve" onclick="approveWithdrawal('${withdrawal._id}')">
                                <i class="fas fa-check"></i>
                                Approve Withdrawal
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            showMessage('Withdrawal not found.');
        }
    } catch (error) {
        console.error('Failed to fetch withdrawal details:', error);
        showMessage('Failed to fetch withdrawal details.');
    }
}


/**
 * Approves a withdrawal request.
 * @param {string} requestId The ID of the withdrawal request to approve.
 */
async function approveWithdrawal(requestId) {
    if (!confirm('Are you sure you want to approve this withdrawal?')) {
        return;
    }

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
            <div class="mt-3">
                <button class="btn-approve" onclick="renderPage('all-users')">View All Users</button>
            </div>
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
                            <div class="user-details">
                                <p><strong>UID:</strong> ${user.uid}</p>
                                <p><strong>Name:</strong> ${user.name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Phone:</strong> ${user.phoneNumber}</p>
                                <p><strong>Balance:</strong> $${(user.totalBalance || 0).toFixed(2)}</p>
                                <p><strong>Plan:</strong> ${user.plan}</p>
                                <p><strong>Level:</strong> ${user.level}</p>
                            </div>
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
        const durationInSeconds = parseInt(document.getElementById('ad-duration').value);

        // Client-side validation to prevent bad requests
        if (!name || !link || isNaN(durationInSeconds) || durationInSeconds <= 0) {
            showMessage('Error: Name, link, and a valid duration (greater than 0) are required fields.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/create-ad`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    videoUrl,
                    imageUrl,
                    link,
                    durationInSeconds,
                    // Adding a unique adId, as the backend model might require it
                    adId: Date.now().toString()
                })
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('Ad created successfully!');
                createAdForm.reset();
            } else {
                console.error('API Error:', data); // Log the full error object from the API
                showMessage(`Error: ${data.message || 'Failed to create ad.'}`);
            }
        } catch (error) {
            console.error('Failed to create ad:', error);
            showMessage('Failed to create ad. An unexpected error occurred.');
        }
    });
}

/**
 * Fetches all users from the API.
 * @returns {Promise<Array>} Array of all users
 */
async function getAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return data.data.users || [];
        } else {
            console.error('Failed to fetch users:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

/**
 * Renders all users in a table format.
 */
async function renderAllUsers() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>All Users</h3>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Balance</th>
                                <th>Plan</th>
                                <th>Level</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="all-users-table-body">
                            <tr><td colspan="8">Loading users...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const usersTableBody = document.getElementById('all-users-table-body');
    try {
        const users = await getAllUsers();

        if (users.length > 0) {
            usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td data-label="UID">${user.uid}</td>
                    <td data-label="Name">${user.name || 'N/A'}</td>
                    <td data-label="Email">${user.email || 'N/A'}</td>
                    <td data-label="Phone">${user.phoneNumber || 'N/A'}</td>
                    <td data-label="Balance">$${(user.totalBalance || 0).toFixed(2)}</td>
                    <td data-label="Plan">${user.plan || 'N/A'}</td>
                    <td data-label="Level">${user.level || 'N/A'}</td>
                    <td data-label="Actions">
                        <div class="action-buttons">
                            <button class="btn-approve btn-small" onclick="viewUserDetails('${user.uid}')">
                                <i class="fas fa-eye"></i>
                                <span class="btn-text">View</span>
                            </button>
                            <button class="btn-approve btn-small" onclick="viewTeam('${user.referralCode}')">
                                <i class="fas fa-users"></i>
                                <span class="btn-text">Team</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            usersTableBody.innerHTML = '<tr><td colspan="8" class="no-data">No users found.</td></tr>';
        }
    } catch (error) {
        console.error('Failed to fetch users:', error);
        usersTableBody.innerHTML = '<tr><td colspan="8" class="error-data">Failed to load users.</td></tr>';
    }
}

/**
 * Views detailed information for a specific user.
 * @param {string} uid The user ID to view details for.
 */
async function viewUserDetails(uid) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/user/${uid}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const user = data.data.user;
            const userDetailsDiv = document.getElementById('all-users-table-body').parentElement.parentElement;

            userDetailsDiv.innerHTML = `
                <div class="card">
                    <h3>User Details - ${user.name}</h3>
                    <div class="user-details">
                        <p><strong>UID:</strong> ${user.uid}</p>
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phoneNumber}</p>
                        <p><strong>Balance:</strong> $${(user.totalBalance || 0).toFixed(2)}</p>
                        <p><strong>Plan:</strong> ${user.plan}</p>
                        <p><strong>Level:</strong> ${user.level}</p>
                        <p><strong>Referral Code:</strong> ${user.referralCode}</p>
                        <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="button-group">
                        <button class="btn-approve" onclick="viewTeam('${user.referralCode}')">View Team</button>
                        <button class="btn-approve" onclick="renderAllUsers()">Back to All Users</button>
                    </div>
                </div>
            `;
        } else {
            showMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to fetch user details:', error);
        showMessage('Failed to fetch user details.');
    }
}

/**
 * Renders the form to add a new admin bank account.
 */
async function renderAddAdminAccount() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Add Admin Bank Account</h3>
            <form id="add-account-form" class="form-container">
                <input type="text" id="account-holder-name" placeholder="Account Holder Name" required>
                <input type="text" id="account-number" placeholder="Account Number" required>
                <input type="text" id="bank-name" placeholder="Bank Name" required>
                <button type="submit">Add Account</button>
            </form>
        </div>
    `;

    const addAccountForm = document.getElementById('add-account-form');
    addAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountHolderName = document.getElementById('account-holder-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const bankName = document.getElementById('bank-name').value;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/account/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountHolderName, accountNumber, bankName })
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('Admin account added successfully!');
                addAccountForm.reset();
            } else {
                showMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Failed to add admin account:', error);
            showMessage('Failed to add admin account.');
        }
    });
}

/**
 * Renders the page to view admin bank account information.
 */
async function renderAdminAccounts() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>Admin Bank Accounts</h3>
            <button class="btn-approve mb-3" onclick="renderAdminAccounts()"><i class="fas fa-sync"></i> Refresh</button>
            <div id="admin-accounts-list" class="accounts-grid">
                <p>Loading accounts...</p>
            </div>
        </div>
    `;

    const accountsList = document.getElementById('admin-accounts-list');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/account`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data) && data.length > 0) {
            accountsList.innerHTML = data.map(account => `
                <div class="account-card">
                    <p><strong>Account Holder:</strong> ${account.accountHolderName}</p>
                    <p><strong>Bank Name:</strong> ${account.bankName}</p>
                    <p><strong>Account Number:</strong> ${account.accountNumber}</p>
                    <p><strong>Status:</strong> <span class="badge ${account.isActive ? 'approved' : 'pending'}">${account.isActive ? 'Active' : 'Inactive'}</span></p>
                    <p class="text-sm text-gray-500 mt-2">Added: ${new Date(account.createdAt).toLocaleDateString()}</p>
                    <div class="account-actions mt-3">
                        <button class="btn-approve btn-small" onclick="editAdminAccount('${account._id}', '${account.accountHolderName}', '${account.accountNumber}', '${account.bankName}', ${account.isActive})">
                            <i class="fas fa-edit"></i>
                            <span class="btn-text">Edit</span>
                        </button>
                        <button class="btn-delete btn-small" onclick="deleteAdminAccount('${account._id}', '${account.accountHolderName}')">
                            <i class="fas fa-trash"></i>
                            <span class="btn-text">Delete</span>
                        </button>
                        ${account.isActive ?
                    `<button class="btn-delete btn-small" onclick="deactivateAdminAccount('${account._id}', '${account.accountHolderName}')">
                                <i class="fas fa-ban"></i>
                                <span class="btn-text">Deactivate</span>
                            </button>` :
                    `<button class="btn-approve btn-small" onclick="activateAdminAccount('${account._id}', '${account.accountHolderName}')">
                                <i class="fas fa-check"></i>
                                <span class="btn-text">Activate</span>
                            </button>`
                }
                    </div>
                </div>
            `).join('');
        } else {
            accountsList.innerHTML = '<p class="no-data">No admin accounts found.</p>';
        }
    } catch (error) {
        console.error('Failed to fetch admin accounts:', error);
        accountsList.innerHTML = `<p class="error-data">Failed to load admin accounts. Please try refreshing.</p>`;
    }
}

/**
 * Deletes an ad from the system.
 * @param {string} _id The ID of the ad to delete.
 * @param {string} adName The name of the ad for confirmation.
 */
async function deleteAd(_id, adName) {
    console.log('Deleting ad:', _id, adName);
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete the ad "${adName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/content/delete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: _id })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage('Ad deleted successfully!');
            renderPage('all-ads'); // Reload the page to show the update
        } else {
            showMessage(`Error: ${data.message || 'Failed to delete ad.'}`);
        }
    } catch (error) {
        console.error('Failed to delete ad:', error);
        showMessage('Failed to delete ad. An unexpected error occurred.');
    }
}

/**
 * Opens the edit form for an admin account.
 * @param {string} _id The account ID to edit.
 * @param {string} accountHolderName The current account holder name.
 * @param {string} accountNumber The current account number.
 * @param {string} bankName The current bank name.
 * @param {boolean} isActive The current active status.
 */
function editAdminAccount(_id, accountHolderName, accountNumber, bankName, isActive) {
    const accountsList = document.getElementById('admin-accounts-list');
    accountsList.innerHTML = `
        <div class="card">
            <h3>Edit Admin Account</h3>
            <form id="edit-account-form" class="form-container">
                <input type="text" id="edit-account-holder-name" value="${accountHolderName}" placeholder="Account Holder Name" required>
                <input type="text" id="edit-account-number" value="${accountNumber}" placeholder="Account Number" required>
                <input type="text" id="edit-bank-name" value="${bankName}" placeholder="Bank Name" required>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-is-active" ${isActive ? 'checked' : ''}>
                        Active Account
                    </label>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn-approve">Update Account</button>
                    <button type="button" class="btn-delete" onclick="renderAdminAccounts()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    const editForm = document.getElementById('edit-account-form');
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedData = {
            accountHolderName: document.getElementById('edit-account-holder-name').value,
            accountNumber: document.getElementById('edit-account-number').value,
            bankName: document.getElementById('edit-bank-name').value,
            isActive: document.getElementById('edit-is-active').checked
        };

        try {
            const response = await fetch(`${API_BASE_URL}/admin/account/${_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('Admin account updated successfully!');
                renderAdminAccounts();
            } else {
                showMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Failed to update admin account:', error);
            showMessage('Failed to update admin account.');
        }
    });
}

/**
 * Deletes an admin account permanently.
 * @param {string} _id The account ID to delete.
 * @param {string} accountHolderName The account holder name for confirmation.
 */
async function deleteAdminAccount(_id, accountHolderName) {
    if (!confirm(`Are you sure you want to permanently delete the account for "${accountHolderName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/account/${_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Admin account deleted successfully!');
            renderAdminAccounts();
        } else {
            showMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to delete admin account:', error);
        showMessage('Failed to delete admin account.');
    }
}

/**
 * Deactivates an admin account (soft delete).
 * @param {string} _id The account ID to deactivate.
 * @param {string} accountHolderName The account holder name for confirmation.
 */
async function deactivateAdminAccount(_id, accountHolderName) {
    if (!confirm(`Are you sure you want to deactivate the account for "${accountHolderName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/account/${_id}/deactivate`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Admin account deactivated successfully!');
            renderAdminAccounts();
        } else {
            showMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to deactivate admin account:', error);
        showMessage('Failed to deactivate admin account.');
    }
}

/**
 * Activates a previously deactivated admin account.
 * @param {string} _id The account ID to activate.
 * @param {string} accountHolderName The account holder name for confirmation.
 */
async function activateAdminAccount(_id, accountHolderName) {
    if (!confirm(`Are you sure you want to activate the account for "${accountHolderName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/account/${_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: true })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Admin account activated successfully!');
            renderAdminAccounts();
        } else {
            showMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to activate admin account:', error);
        showMessage('Failed to activate admin account.');
    }
}

/**
 * Renders a table with all ads.
 */
async function renderAllAds() {
    contentArea.innerHTML = `
        <div class="card">
            <h3>All Ads</h3>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ad Name</th>
                                <th>Video/Image URL</th>
                                <th>Link</th>
                                <th>Duration (s)</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ads-table-body">
                            <tr><td colspan="6">Loading ads...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    const adsTableBody = document.getElementById('ads-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/ads`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();

        // Access the ads array from data.data
        const ads = data?.data?.ads || [];

        if (response.ok && Array.isArray(ads) && ads.length > 0) {
            adsTableBody.innerHTML = ads.map(ad => `
                <tr>
                    <td data-label="Ad Name">${ad.name}</td>
                    <td data-label="URL">
                        ${ad.videoUrl ? `<a href="${ad.videoUrl}" target="_blank">Video Link</a>` : ''}
                        ${ad.imageUrl ? `<a href="${ad.imageUrl}" target="_blank">Image Link</a>` : ''}
                    </td>
                    <td data-label="Link"><a href="${ad.link}" target="_blank">${ad.link}</a></td>
                    <td data-label="Duration">${ad.durationInSeconds || ad.duration || 'N/A'}</td>
                    <td data-label="Created">${new Date(ad.createdAt).toLocaleDateString()}</td>
                    <td data-label="Actions">
                        <button class="btn-delete btn-small" onclick="deleteAd('${ad._id}', '${ad.name}')">
                            <i class="fas fa-trash"></i>
                            <span class="btn-text">Delete</span>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            adsTableBody.innerHTML = '<tr><td colspan="6" class="no-data">No ads found.</td></tr>';
        }
    } catch (error) {
        console.error('Failed to fetch ads:', error);
        adsTableBody.innerHTML = `<tr><td colspan="6" class="error-data">Failed to load ads.</td></tr>`;
    }
}


// ====================================================================================================
// Event Listeners and Initialization
// ====================================================================================================

// Attach login handler
loginForm.addEventListener('submit', handleLogin);

// Attach logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

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