
---

## 🔓 Public APIs (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/health` | Health check |
| GET | `/search/restaurants?q=pizza` | Search restaurants |
| GET | `/search/fuzzy?q=piza` | Fuzzy search |
| GET | `/search/cuisines` | Get all cuisines |
| GET | `/search/cities` | Get all cities |
| GET | `/surge/calculate-fee?distance=5` | Calculate delivery fee |
| GET | `/surge/current-multiplier` | Get surge multiplier |

---

## 🔐 User APIs (User Token Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/create` | Create order |
| PUT | `/orders/cancel/:orderId` | Cancel order |
| POST | `/orders/refund/:orderId` | Request refund |
| GET | `/orders/my` | Get my orders |
| GET | `/orders/:id/tracking` | Track order |
| GET | `/orders/:id/history` | Order history |
| GET | `/notifications` | Get notifications |
| GET | `/recommendations/my` | Get recommendations |

---

## 👑 Admin APIs (Admin Token Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fraud/admin/fraud/alerts` | Get fraud alerts |
| PUT | `/fraud/admin/fraud/alerts/:id/review` | Review alert |
| GET | `/fraud/admin/fraud/statistics` | Fraud statistics |
| GET | `/surge/settings` | Get surge settings |
| PUT | `/surge/settings` | Update surge settings |
| GET | `/delivery/partners` | All delivery partners |
| POST | `/delivery/register` | Register partner |
| GET | `/recommendations/admin/stats` | Recommendation stats |

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@swiggy.com` | `Admin@123` |
| User | `user@test.com` | `123456` |

---

## 📊 API Count

| Category | Count |
|----------|-------|
| Public APIs | 9 |
| User APIs | 7 |
| Admin APIs | 8 |
| **Total** | **24** |