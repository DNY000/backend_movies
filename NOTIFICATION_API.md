# Notification API Documentation

## Overview
Hệ thống thông báo cho phép quản lý các thông báo của người dùng, bao gồm thông báo đặt vé, thanh toán, khuyến mãi và hệ thống.

## Base URL
```
/api/notifications
```

## Authentication
- **User routes**: Yêu cầu authentication token (Bearer token)
- **Admin routes**: Yêu cầu admin authentication token

## API Endpoints

### 1. Lấy tất cả thông báo của user
```http
GET /api/notifications
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `limit` (optional): Số lượng thông báo mỗi trang (default: 10)

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "userId": "user_id",
        "title": "Đặt vé thành công",
        "message": "Bạn đã đặt vé thành công cho phim...",
        "type": "booking",
        "data": {
          "bookingId": "booking_id",
          "movieTitle": "Movie Title"
        },
        "isRead": false,
        "createdAt": "2025-01-06T10:00:00.000Z",
        "updatedAt": "2025-01-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "unreadCount": 5
  },
  "status": 200
}
```

### 2. Lấy thông báo chưa đọc
```http
GET /api/notifications/unread
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `limit` (optional): Số lượng thông báo mỗi trang (default: 10)

**Response:** Tương tự như endpoint trên, nhưng chỉ trả về thông báo chưa đọc.

### 3. Lấy số lượng thông báo chưa đọc
```http
GET /api/notifications/unread-count
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 5
  },
  "status": 200
}
```

### 4. Đánh dấu thông báo đã đọc
```http
PUT /api/notifications/:id/read
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Path Parameters:**
- `id`: ID của thông báo

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Notification marked as read",
  "data": {
    "_id": "notification_id",
    "userId": "user_id",
    "title": "Đặt vé thành công",
    "message": "Bạn đã đặt vé thành công...",
    "type": "booking",
    "isRead": true,
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T10:30:00.000Z"
  },
  "status": 200
}
```

### 5. Đánh dấu tất cả thông báo đã đọc
```http
PUT /api/notifications/read-all
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "All notifications marked as read",
  "data": {
    "count": 5
  },
  "status": 200
}
```

## Admin Endpoints

### 6. Tạo thông báo (Admin)
```http
POST /api/notifications
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "userId": "user_id",
  "title": "Thông báo hệ thống",
  "message": "Nội dung thông báo",
  "type": "system",
  "data": {
    "customData": "value"
  }
}
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Notification created successfully",
  "data": {
    "_id": "notification_id",
    "userId": "user_id",
    "title": "Thông báo hệ thống",
    "message": "Nội dung thông báo",
    "type": "system",
    "data": {
      "customData": "value"
    },
    "isRead": false,
    "createdAt": "2025-01-06T10:30:00.000Z",
    "updatedAt": "2025-01-06T10:30:00.000Z"
  },
  "status": 201
}
```

### 7. Tạo thông báo đặt vé (Admin)
```http
POST /api/notifications/booking
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "userId": "user_id",
  "bookingData": {
    "bookingId": "booking_id",
    "movieTitle": "Movie Title",
    "cinemaName": "Cinema Name",
    "showtime": "2025-01-06T19:00:00.000Z"
  }
}
```

### 8. Tạo thông báo thanh toán (Admin)
```http
POST /api/notifications/payment
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "userId": "user_id",
  "paymentData": {
    "paymentId": "payment_id",
    "amount": 150000,
    "method": "VNPay"
  }
}
```

### 9. Tạo thông báo khuyến mãi (Admin)
```http
POST /api/notifications/promotion
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "userId": "user_id",
  "promotionData": {
    "promotionId": "promotion_id",
    "title": "Giảm giá 20%",
    "discount": 20
  }
}
```

### 10. Tạo thông báo hệ thống (Admin)
```http
POST /api/notifications/system
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "userId": "user_id",
  "systemData": {
    "title": "Bảo trì hệ thống",
    "message": "Hệ thống sẽ bảo trì từ 2:00-4:00 sáng",
    "data": {
      "maintenanceStart": "2025-01-07T02:00:00.000Z",
      "maintenanceEnd": "2025-01-07T04:00:00.000Z"
    }
  }
}
```

## Notification Types
- `general`: Thông báo chung
- `booking`: Thông báo đặt vé
- `payment`: Thông báo thanh toán
- `promotion`: Thông báo khuyến mãi
- `system`: Thông báo hệ thống

## Error Responses
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": false,
  "responseStatus": "error",
  "message": "Error message",
  "status": 400
}
```

## Usage Examples

### Flutter/Dart Example
```dart
// Lấy thông báo chưa đọc
final response = await http.get(
  Uri.parse('$baseUrl/api/notifications/unread'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);

// Đánh dấu thông báo đã đọc
final response = await http.put(
  Uri.parse('$baseUrl/api/notifications/$notificationId/read'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

### JavaScript/React Example
```javascript
// Lấy tất cả thông báo
const getNotifications = async (page = 0, limit = 10) => {
  const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Đánh dấu tất cả đã đọc
const markAllAsRead = async () => {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```
