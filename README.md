# swiggy-backend-clone-main
A production-ready Swiggy clone backend with 6 core features: Fraud Detection, Restaurant Search, Surge Pricing, Delivery Assignment, Real-Time Tracking &amp; Recommendations. Built with Node.js, Express, MongoDB &amp; Socket.io.

# 🚀 Enterprise Food Delivery Backend System

A scalable, production-ready food delivery backend built with Node.js, Express.js, MongoDB, Socket.IO, and JWT Authentication.

The platform includes advanced modules such as fraud detection, intelligent restaurant search, dynamic surge pricing, automated delivery partner assignment, real-time order tracking, and personalized recommendation systems.

---

## ✨ Key Features

### 🔒 Fraud Detection & Order Validation

* Real-time risk scoring engine
* User behavior monitoring
* Fraud alert generation
* Automated user restriction mechanism
* Administrative fraud review dashboard

### 🔍 Advanced Restaurant Search

* Full-text search
* Fuzzy keyword matching
* Multi-parameter filtering
* MongoDB indexing optimization
* Pagination and sorting support

### 📈 Dynamic Surge Pricing

* Time-based surge multipliers
* Distance-based delivery fee calculation
* Peak-hour pricing configuration
* Administrative pricing controls

### 🚚 Smart Delivery Assignment

* Geo-location based matching
* Haversine distance calculation
* Delivery workload balancing
* Availability management

### ⚡ Real-Time Order Tracking

* Socket.IO integration
* Live order status updates
* Notification management
* Order lifecycle monitoring

### 🤖 Recommendation Engine

* Personalized restaurant suggestions
* User preference analysis
* Multi-factor recommendation scoring
* Automatic recommendation generation

---

## 🏗️ System Architecture

Backend Architecture follows a modular and scalable design pattern:

* Controller Layer
* Service Layer
* Repository Layer
* Middleware Layer
* Validation Layer
* Database Layer

The application is designed to support future migration into microservices architecture.

---

## 🛠️ Technology Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Security

* JWT Authentication
* Bcrypt Password Hashing
* Role-Based Access Control

### Real-Time Communication

* Socket.IO

### Validation & Logging

* Joi Validation
* Winston Logger

### Database Tools

* MongoDB Compass

---

## 📊 Project Metrics

| Metric               | Count     |
| -------------------- | --------- |
| API Endpoints        | 58+       |
| Database Collections | 14        |
| Core Modules         | 6         |
| Controllers          | 8+        |
| Services             | 5+        |
| Middleware           | Multiple  |
| WebSocket Events     | 3+        |
| Total Codebase       | 5000+ LOC |

---

## 🔐 Fraud Detection Rules

| Rule                    | Description                       |
| ----------------------- | --------------------------------- |
| Multiple Orders         | Multiple orders within 10 minutes |
| Excessive Cancellations | High cancellation frequency       |
| Coupon Abuse            | Abnormal coupon usage             |
| Refund Abuse            | Multiple refund requests          |
| High Activity Rate      | Suspicious order frequency        |

### Risk Classification

| Score Range | Risk Level |
| ----------- | ---------- |
| 0 - 30      | Low        |
| 31 - 50     | Medium     |
| 51 - 70     | High       |
| 71 - 100    | Critical   |

---

## 📡 Core API Modules

### Authentication

* User Registration
* User Login
* JWT Authorization

### Orders

* Create Order
* Cancel Order
* Refund Request
* Order Tracking

### Fraud Management

* Fraud Alert Review
* Fraud Statistics
* User Restriction Controls

### Restaurant Search

* Search
* Filtering
* Fuzzy Search

### Delivery Management

* Delivery Assignment
* Availability Updates
* Location Tracking

### Recommendations

* Personalized Recommendations
* Recommendation Analytics

---

## 🚀 Getting Started

### Installation

```bash
git clone <repository-url>
cd backend

npm install
```

### Environment Configuration

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/food-delivery-system

JWT_SECRET=your-secret-key

JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

### Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing

The platform has been tested using:

* Postman API Testing
* MongoDB Validation
* Socket.IO Event Testing
* Fraud Detection Scenarios
* Search & Filtering Validation
* Recommendation Accuracy Testing

---

## 📚 Future Enhancements

* Redis Caching
* Docker Deployment
* CI/CD Pipeline
* Payment Gateway Integration
* Push Notifications
* AI-Based Fraud Detection
* Machine Learning Recommendations

---

## 👨‍💻 Developer

Kunal Singh

Backend Developer | MERN Stack Developer

GitHub:
https://github.com/kunalsingh82216-source

---

## 📄 License

MIT License

---

⭐ If you found this project useful, consider giving it a star.
