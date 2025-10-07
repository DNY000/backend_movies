# 🎬 Movie Booking System - API Reference

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## 📚 API Endpoints

### **🎬 Movies**

#### Get Movies with Filters
```http
GET /api/movies?search=action&genre=thriller&year=2024&rating=7&trending=true&page=0&limit=10
```

#### Get Trending Movies
```http
GET /api/movies/trending?limit=10
```

#### Get Popular Movies
```http
GET /api/movies/popular?limit=10
```

#### Get Upcoming Movies
```http
GET /api/movies/upcoming?limit=10
```

#### Get Now Showing Movies
```http
GET /api/movies/now-showing?limit=10
```

---

### **🏢 Venues & Seats**

#### Check Seat Availability
```http
GET /api/venues/seats/availability/:showtimeId?roomId=room123
```

#### Hold Seats Temporarily
```http
POST /api/venues/seats/hold
{
  "showtimeId": "showtime123",
  "seatIds": ["seat1", "seat2"],
  "userId": "user123",
  "holdMinutes": 15
}
```

#### Release Held Seats
```http
POST /api/venues/seats/release
{
  "showtimeId": "showtime123",
  "seatIds": ["seat1", "seat2"],
  "userId": "user123"
}
```

---

### **🎫 Bookings**

#### Create Booking
```http
POST /api/bookings
{
  "userId": "user123",
  "showtimeId": "showtime123",
  "seatIds": ["seat1", "seat2"],
  "promotionCode": "DISCOUNT10"
}
```

#### Get User Booking History
```http
GET /api/bookings/user/:userId?status=paid
```

#### Cancel Booking
```http
PUT /api/bookings/:id/cancel
{
  "userId": "user123"
}
```

#### Get Booking Details with Tickets
```http
GET /api/bookings/:id/details
```

---

### **💳 Payments**

#### Initialize Payment
```http
POST /api/payments/initialize
{
  "bookingId": "booking123",
  "userId": "user123",
  "amount": 200000,
  "method": "vnpay",
  "returnUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment123",
    "transactionId": "TXN_1234567890_ABC",
    "status": "processing",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/...",
    "message": "Redirecting to VNPay"
  }
}
```

#### Payment Webhooks
```http
POST /api/payments/webhook/vnpay
POST /api/payments/webhook/momo
POST /api/payments/webhook/zalopay
```

#### Get Payment Status
```http
GET /api/payments/:id/status
```

---

### **🎟️ Tickets**

#### Generate Tickets (Auto after payment)
```http
POST /api/tickets/generate/:bookingId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "ticket123",
        "movieTitle": "Avengers: Endgame",
        "cinemaName": "CGV Landmark",
        "roomName": "Cinema 1",
        "seatInfo": "A1",
        "showtime": "2024-01-15T19:30:00Z",
        "price": 100000,
        "qrCode": "eyJ0IjoidGlja2V0MTIzIiwiYiI6ImJvb2tpbmcxMjMi...",
        "ticketCode": "TK123456ABC",
        "customerName": "John Doe",
        "status": "valid"
      }
    ],
    "totalTickets": 2,
    "bookingReference": "BK1234ABCD5678"
  }
}
```

#### Validate Ticket QR Code
```http
POST /api/tickets/validate
{
  "qrCode": "eyJ0IjoidGlja2V0MTIzIiwiYiI6ImJvb2tpbmcxMjMi..."
}
```

#### Check-in Ticket
```http
POST /api/tickets/:id/checkin
```

#### Get Booking Tickets
```http
GET /api/tickets/booking/:bookingId
```

---

### **🔐 Authentication**

#### Register
```http
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
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
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/auth/logout
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎯 **Complete Booking Flow Example**

### Step 1: Check Seat Availability
```http
GET /api/venues/seats/availability/showtime123?roomId=room456
```

### Step 2: Hold Seats
```http
POST /api/venues/seats/hold
{
  "showtimeId": "showtime123",
  "seatIds": ["A1", "A2"],
  "userId": "user123",
  "holdMinutes": 15
}
```

### Step 3: Create Booking
```http
POST /api/bookings
{
  "userId": "user123",
  "showtimeId": "showtime123",
  "seatIds": ["A1", "A2"],
  "promotionCode": "DISCOUNT10"
}
```

### Step 4: Initialize Payment
```http
POST /api/payments/initialize
{
  "bookingId": "booking123",
  "userId": "user123",
  "amount": 180000,
  "method": "vnpay",
  "returnUrl": "https://app.com/success"
}
```

### Step 5: User Pays via Gateway
User is redirected to VNPay/MoMo/ZaloPay to complete payment.

### Step 6: Payment Webhook (Automatic)
```http
POST /api/payments/webhook/vnpay
{
  "vnp_ResponseCode": "00",
  "vnp_TxnRef": "payment123",
  "vnp_TransactionNo": "VNP123456789"
}
```

### Step 7: Tickets Generated (Automatic)
System automatically generates tickets with QR codes.

### Step 8: Get Tickets
```http
GET /api/tickets/booking/booking123
```

---

## 📱 **QR Code Format**

QR codes contain Base64 encoded JSON:
```json
{
  "t": "ticket123",           // Ticket ID
  "b": "booking123",          // Booking ID  
  "c": "TK123456ABC",         // Ticket Code
  "s": "showtime123",         // Showtime ID
  "seat": "seat123",          // Seat ID
  "ts": 1704067800000         // Timestamp
}
```

---

## 🚨 **Error Responses**

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎬 **Payment Methods Supported**

- **VNPay**: Vietnamese payment gateway
- **MoMo**: Mobile wallet
- **ZaloPay**: Digital wallet
- **Card**: Credit/Debit cards
- **Bank Transfer**: Direct bank transfer
- **E-Wallet**: Generic e-wallet
- **Cash**: Pay at cinema counter

---

This API reference provides all the endpoints needed to build a complete movie booking application! 🎊
