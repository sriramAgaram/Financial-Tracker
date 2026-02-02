# Expense Tracker API Documentation

This README provides comprehensive documentation for the Expense Tracker API endpoints based on the Postman collection. Use this as a reference for frontend API integration.

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Signup
**Endpoint:** `POST /auth/signup`

**Description:** Register a new user account.

**Request Body:**
```json
{
  "name": "string",
  "username": "string",
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "User signed up successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

### 1.2 Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Data Endpoints

### 2.1 Get Settings Data
**Endpoint:** `GET /data/settingdata`

**Authentication:** Required

**Description:** Get user settings data including limits and expense types.

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Settings data fetched successfully",
  "data": {
    "limits": [
      {
        "limit_id": 1,
        "user_id": 1,
        "monthly_limit": 3000,
        "daily_limit": 100
      }
    ],
    "expenseTypes": [
      {
        "expense_type_id": 1,
        "expense_name": "Food",
        "user_id": 1
      }
    ],
    "userId": 1,
    "totalLimits": 1,
    "totalExpenseTypes": 1
  }
}
```

### 2.2 Get Home Data
**Endpoint:** `GET /data/homedata`

**Authentication:** Required

**Description:** Get user's home dashboard data including balance amounts.

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Data Fetched Successfully",
  "data": {
    "balanceDailyAmt": 50,
    "balanceMonthlyAmt": 2850
  }
}
```

---

## 3. Expense Types Endpoints

### 3.1 Add Expense Type
**Endpoint:** `POST /expencestype/add`

**Authentication:** Required

**Description:** Create a new expense type.

**Request Body:**
```json
{
  "expense_name": "string"
}
```

**Response (Success - 201):**
```json
{
  "status": true,
  "msg": "Expense Type created successfully",
  "data": [
    {
      "expense_type_id": 1,
      "expense_name": "Food",
      "user_id": 1
    }
  ]
}
```

### 3.2 Update Expense Type
**Endpoint:** `PUT /expencestype/update/{id}`

**Authentication:** Required

**Description:** Update an existing expense type.

**Path Parameters:**
- `id` (integer): Expense type ID

**Request Body:**
```json
{
  "expense_name": "string"
}
```

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Expense Type updated successfully",
  "data": [
    {
      "expense_type_id": 1,
      "expense_name": "Groceries",
      "user_id": 1
    }
  ]
}
```

### 3.3 List Expense Types
**Endpoint:** `GET /expencestype/lists`

**Authentication:** Required

**Description:** Get all expense types for the authenticated user.

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Expense Types fetched successfully",
  "data": [
    {
      "expense_type_id": 1,
      "expense_name": "Food",
      "user_id": 1,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "expense_type_id": 2,
      "expense_name": "Transport",
      "user_id": 1,
      "created_at": "2024-01-16T10:30:00Z"
    }
  ]
}
```

### 3.4 Delete Expense Type
**Endpoint:** `DELETE /expencestype/delete/{id}`

**Authentication:** Required

**Description:** Delete an expense type.

**Path Parameters:**
- `id` (integer): Expense type ID

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Expense Type deleted successfully"
}
```

---

## 4. Limits Endpoints

### 4.1 Add Limit
**Endpoint:** `POST /limit/add`

**Authentication:** Required

**Description:** Create spending limits for the user.

**Request Body:**
```json
{
  "daily_limit": "number",
  "monthly_limit": "number"
}
```

**Response (Success - 201):**
```json
{
  "status": true,
  "msg": "Limit created successfully",
  "data": [
    {
      "limit_id": 1,
      "user_id": 1,
      "monthly_limit": 3000,
      "daily_limit": 100
    }
  ]
}
```

### 4.2 Update Limit
**Endpoint:** `PUT /limit/update/{id}`

**Authentication:** Required

**Description:** Update existing spending limits.

**Path Parameters:**
- `id` (integer): Limit ID

**Request Body:**
```json
{
  "daily_limit": "number (optional)",
  "monthly_limit": "number (optional)"
}
```

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Limit updated successfully",
  "data": [
    {
      "limit_id": 1,
      "user_id": 1,
      "monthly_limit": 4000,
      "daily_limit": 150
    }
  ]
}
```

### 4.3 Get All Limits
**Endpoint:** `GET /limit/all`

**Authentication:** Required

**Description:** Get all limits for the authenticated user.

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Limits fetched successfully",
  "data": [
    {
      "limit_id": 1,
      "user_id": 1,
      "monthly_limit": 3000,
      "daily_limit": 100,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4.4 Get Limit by ID
**Endpoint:** `GET /limit/{id}`

**Authentication:** Required

**Description:** Get a specific limit by ID.

**Path Parameters:**
- `id` (integer): Limit ID

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Limit fetched successfully",
  "data": {
    "limit_id": 1,
    "user_id": 1,
    "monthly_limit": 3000,
    "daily_limit": 100,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 5. Transactions Endpoints

### 5.1 Add Transaction
**Endpoint:** `POST /transaction/add`

**Authentication:** Required

**Description:** Create a new expense transaction.

**Request Body:**
```json
{
  "expense_type_id": "integer",
  "amount": "number"
}
```

**Response (Success - 201):**
```json
{
  "status": true,
  "msg": "Transaction created successfully",
  "data": [
    {
      "transaction_id": 1,
      "user_id": 1,
      "expense_type_id": 1,
      "amount": 50.00
    }
  ]
}
```

### 5.2 Update Transaction
**Endpoint:** `PUT /transaction/update/{id}`

**Authentication:** Required

**Description:** Update an existing transaction.

**Path Parameters:**
- `id` (integer): Transaction ID

**Request Body:**
```json
{
  "expense_type_id": "integer (optional)",
  "amount": "number (optional)"
}
```

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Transaction updated successfully",
  "data": [
    {
      "transaction_id": 1,
      "user_id": 1,
      "expense_type_id": 1,
      "amount": 75.00
    }
  ]
}
```

### 5.3 List Transactions
**Endpoint:** `GET /transaction/lists`

**Authentication:** Required

**Description:** Get all transactions for the authenticated user.

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Transactions fetched successfully",
  "data": [
    {
      "transaction_id": 1,
      "user_id": 1,
      "expense_type_id": 1,
      "amount": 50.00,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 5.4 Delete Transaction
**Endpoint:** `DELETE /transaction/delete/{id}`

**Authentication:** Required

**Description:** Delete a transaction.

**Path Parameters:**
- `id` (integer): Transaction ID

**Response (Success - 200):**
```json
{
  "status": true,
  "msg": "Transaction deleted successfully"
}
```

---

## Error Response Format
All endpoints follow a consistent error response format:

```json
{
  "status": false,
  "msg": "Error message description",
  "error": "Detailed error information"
}
```

## Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Frontend API Integration Notes

### Authentication Flow
1. User logs in via `POST /auth/login`
2. Store the returned JWT token in localStorage
3. Include token in Authorization header for all authenticated requests
4. Redirect to login on 401 responses

### Data Types
- All numeric values (limits, amounts) should be sent as numbers, not strings
- IDs are integers
- Dates are returned in ISO 8601 format

### State Management
- Use Redux for API state management
- Implement loading states for better UX
- Handle errors appropriately in the UI

This documentation serves as a complete reference for implementing frontend API calls without mistakes. Always refer to the actual API responses during development as they may contain additional fields.
