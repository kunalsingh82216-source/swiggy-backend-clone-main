# ⚠️ Fraud Detection System - Task 1

## Overview

The Fraud Detection System monitors user behavior in real-time and assigns risk scores (0-100) to orders. Suspicious orders are flagged for admin review.

---

## Fraud Detection Rules

| # | Rule Name | Description | Threshold | Weight |
|---|-----------|-------------|-----------|--------|
| 1 | multiple_orders_short_time | Multiple orders in short time | ≥3 orders in 10 minutes | 40% |
| 2 | excessive_cancellations | Excessive order cancellations | ≥3 in 60 minutes | 30% |
| 3 | abnormal_coupon_usage | Abnormal coupon usage | ≥2 in 30 minutes | 25% |
| 4 | multiple_refund_requests | Multiple refund requests | ≥2 in 24 hours | 50% |
| 5 | high_order_frequency | Unusually high order frequency | >0.5 orders per minute | 35% |

---

## Risk Scoring FormulaTotal Risk Score = Σ (Rule Score × Rule Weightage / 100)

Where:
Rule Score = (Actual Count / Threshold) × 100 (capped at 100)

text

### Example Calculation

User places **4 orders in 10 minutes**:
Rule Score = (4/3) × 100 = 100
Weightage = 40%
Contribution = 100 × 40/100 = 40
Total Risk Score = 40

text

---

## Risk Levels & Actions

| Score Range | Risk Level | Action |
|-------------|------------|--------|
| 0-30 | Low | Normal processing, no alert |
| 31-50 | Medium | Flag order, create alert for review |
| 51-70 | High | Admin review required |
| 71-100 | Critical | Auto-restrict user, cancel order |

---

## Fraud Detection Flow Diagram
User Creates Order
│
▼
Log User Behavior (UserBehaviorLog)
│
▼
Fetch Active Rules (FraudRule)
│
▼
Check: Multiple Orders? → Yes → Add Score
│
▼
Check: Cancellations? → Yes → Add Score
│
▼
Check: Refunds? → Yes → Add Score
│
▼
Calculate Total Risk Score (0-100)
│
▼
Score ≥ 30?
│
┌──┴──┐
No Yes
│ │
▼ ▼
Normal Create FraudAlert
Process Flag Order

text

---

## Database Collections Used

| Collection | Purpose |
|------------|---------|
| userbehaviorlogs | Stores all user actions |
| fraudrules | Stores detection rules |
| fraudalerts | Stores flagged orders |
| frauds | Stores fraud case details |
| users | User restriction status |
| orders | Order fraud flags |

---

## API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/create` | Order with fraud detection |
| PUT | `/api/orders/cancel/:orderId` | Cancel with tracking |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fraud/admin/fraud/alerts` | View fraud alerts |
| PUT | `/api/fraud/admin/fraud/alerts/:id/review` | Review alert |
| GET | `/api/fraud/admin/fraud/statistics` | Fraud statistics |

---

## Sample API Responses

### Fraud Alert Response
```json
{
  "success": true,
  "alerts": [
    {
      "riskScore": 40,
      "riskLevel": "medium",
      "reasons": ["multiple_orders_short_time"],
      "status": "pending"
    }
  ]
}
Fraud Statistics Response
json
{
  "success": true,
  "statistics": {
    "totalAlerts": 5,
    "pendingAlerts": 2,
    "highRiskAlerts": 1,
    "criticalAlerts": 0
  }
}
How to Test Fraud Detection
Step 1: User Login
text
POST /api/auth/login
Body: {"email":"user@test.com","password":"12345"}
Step 2: Create 4 Orders in 10 Minutes
text
POST /api/orders/create
Body: {"items":[{"name":"Pizza","price":299,"quantity":2}],"totalAmount":598,"deliveryAddress":"Test1"}

POST /api/orders/create
Body: {"items":[{"name":"Burger","price":199,"quantity":2}],"totalAmount":398,"deliveryAddress":"Test2"}

POST /api/orders/create
Body: {"items":[{"name":"Pasta","price":249,"quantity":1}],"totalAmount":249,"deliveryAddress":"Test3"}

POST /api/orders/create
Body: {"items":[{"name":"Fries","price":99,"quantity":3}],"totalAmount":297,"deliveryAddress":"Test4"}
Step 3: Check Fraud Alerts (Admin)
text
POST /api/auth/login
Body: {"email":"admin@swiggy.com","password":"Admin@12345"}

GET /api/fraud/admin/fraud/alerts
Authorization: Bearer <admin_token>
Files Implemented for Task 1
File	Purpose
src/models/Fraud.js	Fraud case model
src/models/FraudAlert.js	Fraud alert model
src/models/FraudRule.js	Fraud rules model
src/models/UserBehaviorLog.js	User activity log
src/services/fraudDetectionService.js	Fraud detection logic
src/controllers/fraudController.js	Fraud API controllers
src/middleware/fraudMiddleware.js	Fraud check middleware
src/routes/fraudRoutes.js	Fraud API routes

Task 1 Completion Status

Feature	Status
Fraud Rules	✅ 5 rules implemented
Risk Scoring	✅ 0-100 scoring system
User Behavior Logging	✅ Every action logged
Fraud Alerts	✅ Automatic alert creation
Admin Review	✅ Approve/Reject alerts
User Restriction	✅ Auto-restrict on critical fraud
Fraud Detection System Complete! 🎯




