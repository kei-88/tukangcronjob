# 🚀 Tukang Cron Job - Team Utility Dashboard

A modern, terminal-themed web dashboard for managing scheduled HTTP requests and cron jobs. Built for development teams who need a simple, reliable way to monitor and manage automated tasks.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎨 **Modern Terminal UI** - Sleek, terminal-inspired design with dark theme
- 👥 **Multi-User Support** - Team-ready with configurable user accounts
- ⏰ **Cron Job Management** - Create, monitor, and stop scheduled HTTP requests
- 📊 **Real-time Stats** - Track success rates and execution counts
- 🔒 **Secure Authentication** - Session-based login system
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎯 **Simple Setup** - No database required, just environment variables

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tukangcronjob.git
   cd tukangcronjob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   # Multi-user configuration
   USERS=admin:admin123,developer:devpass,manager:manager456
   
   # Server configuration
   SESSION_SECRET=your-secret-key-here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the dashboard**
   Open your browser and go to `http://localhost:3000`

## 👥 User Management

### Adding New Users

Edit your `.env` file to add more users:

```env
# Format: username:password,username:password
USERS=admin:admin123,developer:devpass,manager:manager456,newuser:newpass
```

### Default Users

After installation, you'll have these default accounts:
- **admin** / `admin123`
- **developer** / `devpass` 
- **manager** / `manager456`

## 🛠️ Usage

### Creating Cron Jobs

1. Login to the dashboard
2. Enter the target URL you want to monitor
3. Select the interval (10 seconds to daily)
4. Click "Add Cron Job"

### Monitoring Jobs

- View all active cron jobs in the dashboard
- See real-time statistics (success rate, total executions)
- Stop jobs individually using the Stop button

### Supported Intervals

- Every 10 seconds
- Every 30 seconds  
- Every 60 seconds
- Every 5 minutes
- Every 15 minutes
- Every 30 minutes
- Every hour
- Every 6 hours
- Daily at midnight

## 🏗️ Project Structure

```
tukangcronjob/
├── views/                 # EJS templates
│   ├── dashboard.ejs     # Main dashboard
│   ├── login.ejs         # Login page
│   └── index.ejs         # Landing page
├── public/               # Static assets
│   ├── videos/          # Background videos
│   └── images/          # Images
├── app.js               # Main application
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USERS` | Comma-separated user credentials | Required |
| `SESSION_SECRET` | Session encryption key | Required |
| `PORT` | Server port | 3000 |

### Customization

The dashboard uses Tailwind CSS for styling. You can customize the appearance by modifying the CSS classes in the EJS templates.

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Redirects to login or dashboard |
| GET | `/login` | Login page |
| POST | `/login` | Authenticate user |
| GET | `/dashboard` | Main dashboard |
| POST | `/add-cron` | Add new cron job |
| POST | `/stop-cron` | Stop existing cron job |
| POST | `/logout` | User logout |

## 🛡️ Security Features

- **Rate Limiting** - Prevents brute force attacks on login
- **Session Management** - Secure session handling
- **Input Validation** - URL and form validation
- **Error Handling** - Graceful error messages

## 🚀 Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start app.js --name "tukangcronjob"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### Environment Variables for Production

Make sure to set strong values for production:

```env
USERS=admin:very-strong-password,user1:another-strong-password
SESSION_SECRET=your-very-long-random-secret-key
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Node.js and Express
- UI designed with Tailwind CSS
- Cron scheduling powered by node-cron
- HTTP requests handled by node-fetch

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/tukangcronjob/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Made with ❤️ by the LASTPIECEL Team**
