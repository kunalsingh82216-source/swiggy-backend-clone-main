# 🗄️ Database Schema - Swiggy Clone

## Database: `swiggy-backend-clone`
## Total Collections: 14

---

## Collection List

| # | Collection | Purpose | Task |
|---|------------|---------|------|
| 1 | users | User authentication | All |
| 2 | restaurants | Restaurant data | Task 2 |
| 3 | menus | Menu items | - |
| 4 | carts | Shopping cart | - |
| 5 | orders | Order management | Task 1,3,4,5 |
| 6 | frauds | Fraud cases | Task 1 |
| 7 | fraudalerts | Fraud alerts | Task 1 |
| 8 | fraudrules | Detection rules | Task 1 |
| 9 | userbehaviorlogs | Activity logs | Task 1 |
| 10 | deliverypartners | Delivery partners | Task 4 |
| 11 | notifications | Real-time notifications | Task 5 |
| 12 | surgesettings | Surge pricing | Task 3 |
| 13 | recommendations | Restaurant recommendations | Task 6 |
| 14 | admins | Admin users | All |

---

## 1. users Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "user|admin|restaurant",
  "isRestricted": "Boolean",
  "fraudRiskScore": "Number",
  "totalOrders": "Number",
  "totalCancellations": "Number",
  "createdAt": "Date"
}

2. restaurants Collection
json
{
  "_id": "ObjectId",
  "name": "String",
  "cuisine": "String",
  "city": "String",
  "rating": "Number",
  "deliveryTime": "Number",
  "isVeg": "Boolean",
  "isApproved": "Boolean"
}
Indexes: name: text, cuisine: text, city: text

3. orders Collection
json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "restaurantId": "ObjectId",
  "items": "Array",
  "totalAmount": "Number",
  "status": "pending|confirmed|preparing|out_for_delivery|delivered|cancelled",
  "isFraudSuspicious": "Boolean",
  "riskScore": "Number",
  "deliveryFee": "Number",
  "surgeMultiplier": "Number",
  "createdAt": "Date"
}
4. frauds Collection
json
{
  "_id": "ObjectId",
  "orderId": "ObjectId",
  "userId": "ObjectId",
  "riskScore": "Number (0-100)",
  "riskLevel": "low|medium|high|critical",
  "status": "pending|approved|rejected",
  "createdAt": "Date"
}
5. fraudalerts Collection
json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "orderId": "ObjectId",
  "riskScore": "Number",
  "reasons": "Array",
  "status": "pending|approved|rejected"
}
6. fraudrules Collection
json
{
  "_id": "ObjectId",
  "ruleName": "String",
  "enabled": "Boolean",
  "parameters": {
    "timeWindowMinutes": "Number",
    "threshold": "Number",
    "weightage": "Number"
  },
  "action": "flag|restrict|block"
}

7. userbehaviorlogs Collection
json

{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "action": "order_created|order_cancelled|refund_requested",
  "orderId": "ObjectId",
  "timestamp": "Date"
}

Indexes: userId: 1, timestamp: -1

8. deliverypartners Collection
json

{
  "_id": "ObjectId",
  "name": "String",
  "phone": "String",
  "email": "String",
  "isAvailable": "Boolean",
  "currentLocation": {
    "type": "Point",
    "coordinates": [Number, Number]
  },
  "currentOrders": "Number",
  "rating": "Number"
}

Indexes: currentLocation: 2dsphere

9. notifications Collection
json

{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "orderId": "ObjectId",
  "title": "String",
  "message": "String",
  "isRead": "Boolean",
  "createdAt": "Date"
}

10. surgesettings Collection
json

{
  "_id": "ObjectId",
  "peakHours": {
    "morning": {"multiplier": 1.2},
    "lunch": {"multiplier": 1.5},
    "dinner": {"multiplier": 1.8}
  },
  "baseDeliveryFee": "Number",
  "maxSurgeMultiplier": "Number",
  "isEnabled": "Boolean"
}

11. recommendations Collection
json

{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "restaurantId": "ObjectId",
  "score": "Number",
  "isViewed": "Boolean",
  "createdAt": "Date"
}

12. admins Collection
json

{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)"
}

13. menus Collection
json

{
  "_id": "ObjectId",
  "restaurantId": "ObjectId",
  "name": "String",
  "price": "Number",
  "isVeg": "Boolean"
}

14. carts Collection
json

{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "restaurantId": "ObjectId",
  "items": "Array",
  "totalAmount": "Number"
}

📊 Entity Relationship Diagram

users ──┬── orders ──┬── restaurants
        │            │
        ├── frauds   ├── menus
        │            │
        ├── notifications ──┐
        │                    │
        ├── recommendations  │
        │                    │
        └── userbehaviorlogs │
                             │
deliverypartners ────────────┘

📈 Indexes Summary

Collection	Indexes
restaurants	name: text, cuisine: text, city: text, rating: -1
orders	userId: 1, createdAt: -1
userbehaviorlogs	userId: 1, timestamp: -1
deliverypartners	currentLocation: 2dsphere
notifications	userId: 1, createdAt: -1
recommendations	userId: 1, score: -1
text

---

# ✅ Documentation Complete!

| File | Status |
|------|--------|
| `API_Documentation.md` | ✅ |
| `Postman_Collection.json` | ✅ |
| `Database_Schema.md` | ✅ |
| `Fraud_Detection_Flow.md` | ✅ |
| `System_Architecture.md` | ✅ |

---

