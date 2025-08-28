# StatusPage - Service Status Management Application

A comprehensive status page application similar to StatusPage, Cachet, or Betterstack, built with Vue.js, Node.js, and MongoDB. This application allows organizations to manage their services, track incidents, schedule maintenance, and provide real-time status updates to their customers.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure login/registration with JWT tokens
- **Multi-tenant Organizations** - Support for multiple organizations with isolated data
- **Team Management** - Role-based access control (Admin, Manager, Member, Viewer)
- **Service Management** - CRUD operations for services with status tracking
- **Incident Management** - Create, update, and resolve incidents with real-time updates
- **Maintenance Scheduling** - Plan and manage maintenance windows
- **Real-time Updates** - WebSocket integration for live status changes
- **Public Status Page** - Customer-facing status page with service information

### Technical Features
- **Modern Frontend** - Vue 3 with TypeScript, Vuex for state management
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Communication** - Socket.io for live updates
- **RESTful API** - Well-structured API with proper error handling
- **Database Integration** - MongoDB with Mongoose ODM
- **Security** - JWT authentication, password hashing, CORS protection

## 🛠 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vuex** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd status-page-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=7d
# PORT=5000

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Public Status Page**: http://localhost:3000/status/{organization-slug}

## 📁 Project Structure

```
status-page-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── organizationController.js
│   │   │   ├── serviceController.js
│   │   │   ├── incidentController.js
│   │   │   └── maintenanceController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Organization.js
│   │   │   ├── Service.js
│   │   │   ├── Incident.js
│   │   │   ├── Maintenance.js
│   │   │   ├── Team.js
│   │   │   └── StatusUpdate.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   ├── incidentRoutes.js
│   │   │   ├── maintenanceRoutes.js
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/password` - Change password
- `POST /api/v1/auth/logout` - User logout

### Organizations
- `GET /api/v1/organizations/stats` - Get organization statistics
- `PUT /api/v1/organizations/settings` - Update organization settings
- `GET /api/v1/organizations/public/:slug` - Get public organization info

### Services
- `GET /api/v1/services` - Get all services
- `POST /api/v1/services` - Create new service
- `GET /api/v1/services/:id` - Get service by ID
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service
- `PATCH /api/v1/services/:id/status` - Update service status
- `GET /api/v1/services/public/:slug` - Get public services

### Incidents
- `GET /api/v1/incidents` - Get all incidents
- `POST /api/v1/incidents` - Create new incident
- `GET /api/v1/incidents/:id` - Get incident by ID
- `PUT /api/v1/incidents/:id` - Update incident
- `DELETE /api/v1/incidents/:id` - Delete incident
- `POST /api/v1/incidents/:id/updates` - Add incident update
- `GET /api/v1/incidents/public/:slug` - Get public incidents

### Maintenance
- `GET /api/v1/maintenance` - Get all maintenance
- `POST /api/v1/maintenance` - Create new maintenance
- `GET /api/v1/maintenance/:id` - Get maintenance by ID
- `PUT /api/v1/maintenance/:id` - Update maintenance
- `DELETE /api/v1/maintenance/:id` - Delete maintenance
- `PATCH /api/v1/maintenance/:id/status` - Update maintenance status
- `POST /api/v1/maintenance/:id/updates` - Add maintenance update
- `GET /api/v1/maintenance/public/:slug` - Get public maintenance

## 🗄 Database Schema

### Users
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `firstName` (String, required)
- `lastName` (String, required)
- `role` (String, enum: ['admin', 'manager', 'member', 'viewer'])
- `organization` (ObjectId, ref: 'Organization')
- `teams` ([ObjectId], ref: 'Team')
- `isActive` (Boolean, default: true)
- `lastLogin` (Date)
- `preferences` (Object)

### Organizations
- `name` (String, required)
- `slug` (String, required, unique)
- `description` (String)
- `logo` (String, URL)
- `primaryColor` (String, hex color)
- `settings` (Object)

### Services
- `name` (String, required)
- `description` (String)
- `organization` (ObjectId, ref: 'Organization', required)
- `team` (ObjectId, ref: 'Team')
- `status` (String, enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance'])
- `category` (String, enum: ['website', 'api', 'database', 'infrastructure', 'third_party', 'other'])
- `url` (String)
- `uptime` (Object with current, last24h, last7d, last30d)
- `isPublic` (Boolean, default: true)
- `isActive` (Boolean, default: true)
- `tags` ([String])

### Incidents
- `title` (String, required)
- `description` (String, required)
- `organization` (ObjectId, ref: 'Organization', required)
- `services` ([ObjectId], ref: 'Service')
- `status` (String, enum: ['investigating', 'identified', 'monitoring', 'resolved'])
- `severity` (String, enum: ['low', 'medium', 'high', 'critical'])
- `isActive` (Boolean, default: true)
- `isPublic` (Boolean, default: true)
- `updates` ([Object] with message, author, timestamp)
- `createdBy` (ObjectId, ref: 'User')

### Maintenance
- `title` (String, required)
- `description` (String, required)
- `organization` (ObjectId, ref: 'Organization', required)
- `services` ([ObjectId], ref: 'Service', required)
- `status` (String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'])
- `scheduledStart` (Date, required)
- `scheduledEnd` (Date, required)
- `actualStart` (Date)
- `actualEnd` (Date)
- `impact` (String, enum: ['none', 'minor', 'major', 'critical'])
- `isPublic` (Boolean, default: true)
- `isActive` (Boolean, default: true)
- `updates` ([Object] with message, status, author, timestamp)
- `createdBy` (ObjectId, ref: 'User')

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user_id_here",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-based Access Control
- **Admin**: Full access to all features
- **Manager**: Can manage services, incidents, and maintenance
- **Member**: Can view and update status, create incidents
- **Viewer**: Read-only access to dashboard and status

## 🌐 Real-time Features

### WebSocket Events
- `service-status-updated` - When service status changes
- `incident-created` - When new incident is created
- `incident-updated` - When incident is updated
- `maintenance-created` - When maintenance is scheduled
- `maintenance-updated` - When maintenance is updated

### Socket.io Integration
The application uses Socket.io for real-time communication between the server and clients. Events are emitted to organization-specific rooms for data isolation.

## 🎨 UI Components

### Dashboard
- Service status overview
- Recent activity feed
- Quick action buttons
- Real-time statistics

### Service Management
- Service listing with filters
- Service creation/editing forms
- Status update functionality
- Service details view

### Incident Management
- Incident listing with filters
- Incident creation/editing forms
- Update tracking
- Resolution workflow

### Maintenance Management
- Maintenance scheduling
- Timeline view
- Status tracking
- Update management

### Team Management
- User listing with roles
- Team creation and management
- Permission management
- Activity tracking

### Settings
- Organization settings
- User preferences
- Notification settings
- API key management

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/statuspage
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Planned Features
- [ ] Email notifications
- [ ] Slack/Discord integration
- [ ] Custom domains for status pages
- [ ] Advanced analytics and reporting
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced monitoring integrations
- [ ] Automated incident detection
- [ ] Performance metrics dashboard

### Future Enhancements
- [ ] SSO integration (OAuth, SAML)
- [ ] Advanced role permissions
- [ ] Custom status page themes
- [ ] Webhook integrations
- [ ] Advanced scheduling features
- [ ] Bulk operations
- [ ] Data export/import
- [ ] Advanced search and filtering

---

**Built with ❤️ using Vue.js, Node.js, and MongoDB**
