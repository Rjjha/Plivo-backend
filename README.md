# Status Page API Backend

A Node.js/Express.js backend for a status page application with real-time updates, team management, and incident tracking.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access
- **Organization Management** - Multi-tenant support
- **Service Management** - CRUD operations for services with status tracking
- **Incident Management** - Full incident lifecycle with updates
- **Maintenance Scheduling** - Planned maintenance windows
- **Team Management** - User roles and team assignments
- **Real-time Updates** - WebSocket integration with Socket.io
- **Activity Tracking** - Recent activity feed for dashboard

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Built-in validation
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd status-page-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/statuspage
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication APIs

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "68aff7f44e4c30f4ae5be5fe",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "isActive": true,
      "createdAt": "2025-08-28T06:32:20.419Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "68aff7f44e4c30f4ae5be5fe",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organization": "68aff7f44e4c30f4ae5be5fc"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68aff7f44e4c30f4ae5be5fe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organization": "68aff7f44e4c30f4ae5be5fc",
    "isActive": true,
    "lastLogin": "2025-08-28T06:53:25.520Z"
  }
}
```

---

## 🏢 Organization APIs

### Get Organization Stats
**GET** `/organizations/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalServices": 5,
    "operationalServices": 3,
    "activeIncidents": 1,
    "scheduledMaintenance": 2,
    "totalUsers": 8,
    "totalTeams": 3
  }
}
```

---

## 🔧 Service APIs

### Get All Services
**GET** `/services`

**Query Parameters:**
- `category` - Filter by category (website, api, database, etc.)
- `status` - Filter by status (operational, degraded_performance, etc.)
- `team` - Filter by team ID
- `isPublic` - Filter by public visibility (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68aff7fc4e4c30f4ae5be601",
      "name": "Test API",
      "description": "Test service",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "status": "operational",
      "category": "api",
      "url": "https://api.test.com",
      "isPublic": true,
      "isActive": true,
      "uptime": {
        "current": 100,
        "last24h": 100,
        "last7d": 100,
        "last30d": 100
      },
      "createdAt": "2025-08-28T06:32:28.316Z"
    }
  ]
}
```

### Create Service
**POST** `/services`

**Request Body:**
```json
{
  "name": "Website",
  "description": "Main company website",
  "category": "website",
  "url": "https://example.com",
  "team": "68b0020397d734243f9bce72",
  "tags": ["frontend", "critical"],
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68aff7fc4e4c30f4ae5be601",
    "name": "Website",
    "description": "Main company website",
    "organization": "68aff7f44e4c30f4ae5be5fc",
    "status": "operational",
    "category": "website",
    "url": "https://example.com",
    "isPublic": true,
    "isActive": true,
    "tags": ["frontend", "critical"],
    "createdAt": "2025-08-28T06:32:28.316Z"
  }
}
```

### Get Service by ID
**GET** `/services/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68aff7fc4e4c30f4ae5be601",
    "name": "Website",
    "description": "Main company website",
    "organization": {
      "_id": "68aff7f44e4c30f4ae5be5fc",
      "name": "Test Org 2",
      "slug": "test-org-2"
    },
    "status": "operational",
    "category": "website",
    "url": "https://example.com",
    "isPublic": true,
    "isActive": true,
    "uptime": {
      "current": 100,
      "last24h": 100,
      "last7d": 100,
      "last30d": 100
    },
    "createdAt": "2025-08-28T06:32:28.316Z"
  }
}
```

### Update Service Status
**PATCH** `/services/:id/status`

**Request Body:**
```json
{
  "status": "degraded_performance",
  "message": "Experiencing high latency"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68aff7fc4e4c30f4ae5be601",
    "name": "Website",
    "status": "degraded_performance",
    "statusMessage": "Experiencing high latency",
    "lastCheck": "2025-08-28T07:30:00.000Z"
  }
}
```

### Get Service Status History
**GET** `/services/:id/history`

**Query Parameters:**
- `limit` - Number of records to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68affd35a6e978700ee766dd",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "service": "68aff7fc4e4c30f4ae5be601",
      "newStatus": "under_maintenance",
      "message": "Maintenance scheduled",
      "triggeredBy": "maintenance",
      "maintenance": "68affd35a6e978700ee766db",
      "author": {
        "_id": "68aff7f44e4c30f4ae5be5fe",
        "firstName": "Test",
        "lastName": "User"
      },
      "isPublic": true,
      "createdAt": "2025-08-28T06:54:45.170Z"
    }
  ]
}
```

---

## 🚨 Incident APIs

### Get All Incidents
**GET** `/incidents`

**Query Parameters:**
- `status` - Filter by status (investigating, identified, monitoring, resolved)
- `severity` - Filter by severity (low, medium, high, critical)
- `service` - Filter by service ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68b00712531defea16cabb6c",
      "title": "API Response Time Issues",
      "description": "Users experiencing slow response times on API endpoints",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "services": [
        {
          "_id": "68aff7fc4e4c30f4ae5be601",
          "name": "Test API",
          "category": "api"
        }
      ],
      "status": "investigating",
      "severity": "medium",
      "impact": "minor",
      "isPublic": true,
      "isActive": true,
      "startedAt": "2025-08-28T07:36:50.802Z",
      "createdAt": "2025-08-28T07:36:50.802Z"
    }
  ]
}
```

### Create Incident
**POST** `/incidents`

**Request Body:**
```json
{
  "title": "Database Connection Issues",
  "description": "Users unable to access database services",
  "severity": "high",
  "status": "investigating",
  "services": ["68aff7fc4e4c30f4ae5be601"],
  "isPublic": true,
  "message": "Initial investigation started"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68b00712531defea16cabb6c",
    "title": "Database Connection Issues",
    "description": "Users unable to access database services",
    "organization": "68aff7f44e4c30f4ae5be5fc",
    "services": ["68aff7fc4e4c30f4ae5be601"],
    "status": "investigating",
    "severity": "high",
    "impact": "major",
    "isPublic": true,
    "isActive": true,
    "startedAt": "2025-08-28T07:36:50.802Z",
    "updates": [
      {
        "message": "Initial investigation started",
        "status": "investigating",
        "author": "68aff7f44e4c30f4ae5be5fe",
        "createdAt": "2025-08-28T07:36:50.802Z"
      }
    ],
    "createdAt": "2025-08-28T07:36:50.802Z"
  }
}
```

### Add Incident Update
**POST** `/incidents/:id/updates`

**Request Body:**
```json
{
  "message": "Root cause identified - database connection pool exhausted",
  "status": "identified"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Root cause identified - database connection pool exhausted",
    "status": "identified",
    "author": "68aff7f44e4c30f4ae5be5fe",
    "createdAt": "2025-08-28T07:40:00.000Z"
  }
}
```

---

## 🔧 Maintenance APIs

### Get All Maintenance
**GET** `/maintenance`

**Query Parameters:**
- `status` - Filter by status (scheduled, in_progress, completed, cancelled)
- `service` - Filter by service ID
- `isPublic` - Filter by public visibility (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68affd35a6e978700ee766db",
      "title": "Database Maintenance",
      "description": "Routine database optimization",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "services": [
        {
          "_id": "68aff7fc4e4c30f4ae5be601",
          "name": "Test API",
          "category": "api"
        }
      ],
      "status": "scheduled",
      "scheduledStart": "2025-08-29T02:00:00.000Z",
      "scheduledEnd": "2025-08-29T04:00:00.000Z",
      "isPublic": true,
      "createdAt": "2025-08-28T06:54:45.170Z"
    }
  ]
}
```

### Create Maintenance
**POST** `/maintenance`

**Request Body:**
```json
{
  "title": "System Upgrade",
  "description": "Upgrading system components for better performance",
  "services": ["68aff7fc4e4c30f4ae5be601"],
  "scheduledStart": "2025-08-29T02:00:00.000Z",
  "scheduledEnd": "2025-08-29T04:00:00.000Z",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68affd35a6e978700ee766db",
    "title": "System Upgrade",
    "description": "Upgrading system components for better performance",
    "organization": "68aff7f44e4c30f4ae5be5fc",
    "services": ["68aff7fc4e4c30f4ae5be601"],
    "status": "scheduled",
    "scheduledStart": "2025-08-29T02:00:00.000Z",
    "scheduledEnd": "2025-08-29T04:00:00.000Z",
    "isPublic": true,
    "createdAt": "2025-08-28T06:54:45.170Z"
  }
}
```

---

## 👥 Team APIs

### Get All Teams
**GET** `/teams`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68b0020397d734243f9bce72",
      "name": "Engineering Team",
      "description": "Core engineering team for development",
      "organization": "68aff7f44e4c30f4ae5be5fc",
      "members": [
        {
          "user": {
            "_id": "68aff7f44e4c30f4ae5be5fe",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "admin"
          },
          "role": "member",
          "joinedAt": "2025-08-28T07:15:15.470Z"
        }
      ],
      "color": "#3B82F6",
      "isActive": true,
      "createdAt": "2025-08-28T07:15:15.470Z"
    }
  ]
}
```

### Create Team
**POST** `/teams`

**Request Body:**
```json
{
  "name": "DevOps Team",
  "description": "Infrastructure and operations team",
  "color": "#10B981",
  "members": ["68aff7f44e4c30f4ae5be5fe"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68b0020397d734243f9bce72",
    "name": "DevOps Team",
    "description": "Infrastructure and operations team",
    "organization": "68aff7f44e4c30f4ae5be5fc",
    "members": [
      {
        "user": {
          "_id": "68aff7f44e4c30f4ae5be5fe",
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com",
          "role": "admin"
        },
        "role": "member",
        "joinedAt": "2025-08-28T07:15:15.470Z"
      }
    ],
    "color": "#10B981",
    "isActive": true,
    "createdAt": "2025-08-28T07:15:15.470Z"
  }
}
```

### Get Team Statistics
**GET** `/teams/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 8,
    "activeUsers": 7,
    "totalTeams": 3,
    "roleDistribution": {
      "admin": 2,
      "manager": 3,
      "member": 3
    }
  }
}
```

---

## 📊 Activity APIs

### Get Recent Activity
**GET** `/activity/recent`

**Query Parameters:**
- `limit` - Number of activities to return (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "68affd35a6e978700ee766dd",
      "type": "status_update",
      "title": "Status updated for Test API",
      "description": "Status changed due to maintenance: Test Maintenance",
      "status": "under_maintenance",
      "timestamp": "2025-08-28T06:54:45.170Z",
      "author": {
        "_id": "68aff7f44e4c30f4ae5be5fe",
        "firstName": "Test",
        "lastName": "User"
      },
      "service": {
        "_id": "68aff7fc4e4c30f4ae5be601",
        "name": "Test API",
        "category": "api"
      },
      "maintenance": {
        "_id": "68affd35a6e978700ee766db",
        "title": "Test Maintenance"
      },
      "triggeredBy": "maintenance"
    }
  ]
}
```

---

## 🔌 WebSocket Events

The API also supports real-time updates via WebSocket connections.

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Events

**Service Events:**
- `service-status-updated` - When service status changes
- `service-created` - When new service is created
- `service-updated` - When service is updated
- `service-deleted` - When service is deleted

**Incident Events:**
- `incident-created` - When new incident is created
- `incident-updated` - When incident is updated
- `incident-status-updated` - When incident status changes
- `incident-update-added` - When incident update is added
- `incident-resolved` - When incident is resolved

**Maintenance Events:**
- `maintenance-created` - When maintenance is scheduled
- `maintenance-updated` - When maintenance is updated
- `maintenance-status-updated` - When maintenance status changes
- `maintenance-update-added` - When maintenance update is added
- `maintenance-deleted` - When maintenance is cancelled

**Team Events:**
- `team-created` - When new team is created
- `team-updated` - When team is updated
- `team-deleted` - When team is deleted
- `user-role-updated` - When user role changes
- `user-status-updated` - When user status changes

---

## 🚀 Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔒 Security

- **JWT Authentication** - All protected endpoints require valid JWT tokens
- **Role-based Access** - Different endpoints require different user roles
- **CORS Protection** - Configured for frontend domain
- **Rate Limiting** - Prevents abuse
- **Helmet** - Security headers
- **Input Validation** - All inputs are validated

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.
