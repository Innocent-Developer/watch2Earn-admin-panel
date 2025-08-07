# Admin Panel - Watch2Earn Platform

A modern, responsive admin panel for managing the Watch2Earn platform with comprehensive user management, transaction monitoring, and content creation capabilities.

## 🚀 Features

### 🔐 Authentication & Security
- Secure admin login system
- JWT token-based authentication
- Session management with localStorage
- Protected admin routes

### 📊 Dashboard Analytics
- Real-time statistics overview
- Total deposits and withdrawal amounts
- Transaction counts and financial metrics
- Interactive data visualization

### 💰 Financial Management
- **Deposits Management**
  - View all deposit requests
  - Approve/reject pending deposits
  - Track deposit status (pending, approved, rejected)
  - Real-time deposit statistics

- **Withdrawals Management**
  - Monitor withdrawal requests
  - Process withdrawal approvals
  - Track withdrawal status
  - Withdrawal amount tracking

### 👥 User Management
- Search users by UID or email
- View detailed user information
- Check user balances
- View user referral teams
- Team hierarchy visualization

### 📢 Content Management
- Create new advertisement campaigns
- Set reward amounts for ads
- Manage ad content and URLs
- Content approval workflow

### 🎨 Modern UI/UX
- Responsive design for all devices
- Smooth animations and transitions
- Modern purple theme with gradients
- Interactive hover effects
- Loading states and feedback

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome 6.0
- **API**: RESTful API integration
- **Authentication**: JWT Tokens
- **Storage**: localStorage for session management

## 📁 Project Structure

```
admin-panel/
├── index.html          # Main HTML file
├── style.css           # Stylesheet with animations
├── script.js           # JavaScript functionality
└── README.md          # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls
- Admin credentials for the Watch2Earn platform

### Installation

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd admin-panel
   
   # Or download and extract the ZIP file
   ```

2. **Open the Application**
   ```bash
   # Using a local server (recommended)
   python -m http.server 8000
   # or
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Access the Admin Panel**
   - Open your browser and navigate to `http://localhost:8000`
   - Login with your admin credentials
   - Start managing your platform!

## 🔧 Configuration

### API Configuration
The admin panel connects to the Watch2Earn API. Update the API base URL in `script.js`:

```javascript
const API_BASE_URL = 'https://watch2earn-vie97.ondigitalocean.app/api';
```

### Customization
You can customize the appearance by modifying CSS variables in `style.css`:

```css
:root {
    --primary-color: #6b21a8;
    --secondary-color: #a78bfa;
    --dark-purple: #5b21b6;
    /* Add more custom colors */
}
```

## 📖 Usage Guide

### 🔐 Login Process
1. Enter your admin email and password
2. Click "Login" to authenticate
3. The system will validate your credentials
4. Upon successful login, you'll be redirected to the dashboard

### 📊 Dashboard Navigation
- **Dashboard**: Overview of platform statistics
- **Deposits**: Manage user deposit requests
- **Withdrawals**: Process withdrawal approvals
- **Users**: Search and manage user accounts
- **Create Ad**: Add new advertisement campaigns

### 💰 Managing Deposits
1. Navigate to the "Deposits" section
2. View all deposit requests in the table
3. Click "Approve" for pending deposits
4. Monitor status changes in real-time

### 💸 Processing Withdrawals
1. Go to the "Withdrawals" section
2. Review withdrawal requests
3. Approve legitimate withdrawal requests
4. Track processed withdrawals

### 👥 User Management
1. Navigate to "Users" section
2. Search by UID or email address
3. View user details and balance
4. Check user's referral team structure

### 📢 Creating Ads
1. Go to "Create Ad" section
2. Fill in ad details:
   - Title
   - Description
   - Video URL
   - Reward amount
3. Submit to create new ad campaign

## 🎨 Features & Animations

### Smooth Transitions
- Page transitions with fade effects
- Sidebar slide animations
- Button hover effects
- Loading state animations

### Interactive Elements
- Hover effects on cards and buttons
- Active state indicators
- Responsive sidebar toggle
- Real-time data updates

### Error Handling
- Comprehensive error messages
- Network error detection
- Validation feedback
- User-friendly error displays

## 🔒 Security Features

- JWT token authentication
- Secure API communication
- Session timeout handling
- Input validation
- XSS protection

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🐛 Troubleshooting

### Common Issues

**Login Problems**
- Check your internet connection
- Verify your admin credentials
- Clear browser cache and try again

**API Connection Issues**
- Ensure the API server is running
- Check the API base URL configuration
- Verify network connectivity

**Display Issues**
- Clear browser cache
- Try a different browser
- Check browser console for errors

### Error Messages

| Error | Solution |
|-------|----------|
| "Invalid email or password" | Check your credentials |
| "Network error" | Check internet connection |
| "API not responding" | Verify API server status |
| "Session expired" | Re-login to refresh token |

## 🔄 API Endpoints

The admin panel uses the following API endpoints:

- `POST /api/login` - Admin authentication
- `GET /api/admin/deposits/stats` - Deposit statistics
- `GET /api/admin/withdrawals/stats` - Withdrawal statistics
- `GET /api/admin/deposits` - List deposits
- `PUT /api/admin/deposit/approve/{id}` - Approve deposit
- `GET /api/admin/withdrawals` - List withdrawals
- `PUT /api/admin/withdrawal/approve/{id}` - Approve withdrawal
- `GET /api/admin/users/search` - Search users by email
- `GET /api/admin/user/{uid}` - Get user by UID
- `GET /api/team/{referralCode}` - Get user team
- `POST /api/admin/create-ad` - Create new ad

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for the Watch2Earn platform.

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review the API documentation
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core admin functionality
- **v1.1.0** - Added animations and improved UI
- **v1.2.0** - Enhanced error handling and responsive design

---

**Built with ❤️ for the Watch2Earn Platform** 