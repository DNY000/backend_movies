# Scheduled Notification API Documentation

## Overview
Hệ thống tự động gửi thông báo nhắc nhở cho người dùng về vé xem phim sắp tới. Hệ thống sẽ tự động gửi thông báo:
- **Trước 1 ngày (24h)**: Nhắc nhở xem phim ngày mai
- **Trước 12 giờ**: Nhắc nhở xem phim sắp tới và đến sớm 15 phút

## Base URL
```
/api/scheduled-notifications
```

## Authentication
Tất cả endpoints yêu cầu **admin authentication token**.

## Tự động hoạt động
Hệ thống tự động chạy khi server khởi động và kiểm tra mỗi 30 phút để gửi thông báo.

## API Endpoints

### 1. Gửi thông báo thủ công
```http
POST /api/scheduled-notifications/manual-reminder
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "showtimeId": "showtime_id",
  "reminderType": "day_before"
}
```

**Reminder Types:**
- `day_before`: Gửi thông báo trước 1 ngày
- `12_hours_before`: Gửi thông báo trước 12 giờ

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Manual reminder sent successfully",
  "data": {
    "showtimeId": "showtime_id",
    "reminderType": "day_before"
  },
  "status": 200
}
```

### 2. Lấy thống kê thông báo
```http
GET /api/scheduled-notifications/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Notification stats retrieved successfully",
  "data": {
    "dayBeforeSent": 15,
    "twelveHoursBeforeSent": 8,
    "totalBookings": 50
  },
  "status": 200
}
```

### 3. Khởi động lại scheduled tasks
```http
POST /api/scheduled-notifications/restart
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Scheduled tasks restarted successfully",
  "data": {
    "message": "Scheduled tasks restarted"
  },
  "status": 200
}
```

### 4. Dừng scheduled tasks
```http
POST /api/scheduled-notifications/stop
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Scheduled tasks stopped successfully",
  "data": {
    "message": "Scheduled tasks stopped"
  },
  "status": 200
}
```

### 5. Khởi động scheduled tasks
```http
POST /api/scheduled-notifications/start
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T10:30:00.000Z",
  "success": true,
  "responseStatus": "success",
  "message": "Scheduled tasks started successfully",
  "data": {
    "message": "Scheduled tasks started"
  },
  "status": 200
}
```

## Cách hoạt động

### 1. Tự động gửi thông báo
- Hệ thống chạy mỗi 30 phút
- Kiểm tra các showtime sắp tới trong khoảng thời gian:
  - **24h ± 1h**: Gửi thông báo trước 1 ngày
  - **12h ± 30 phút**: Gửi thông báo trước 12 giờ

### 2. Tránh gửi trùng lặp
- Kiểm tra xem đã gửi thông báo cho showtime này chưa
- Sử dụng `reminderType` để phân biệt loại thông báo
- Chỉ gửi cho booking có status `confirmed`

### 3. Nội dung thông báo

#### Thông báo trước 1 ngày:
```
Title: "Nhắc nhở xem phim ngày mai"
Message: "Bạn có vé xem phim [Movie Title] ngày mai lúc [Time] tại [Cinema Name]"
```

#### Thông báo trước 12 giờ:
```
Title: "Nhắc nhở xem phim sắp tới"
Message: "Bạn có vé xem phim [Movie Title] lúc [Time] tại [Cinema Name]. Hãy đến sớm 15 phút!"
```

### 4. Dữ liệu thông báo
```json
{
  "bookingId": "booking_id",
  "showtimeId": "showtime_id", 
  "movieTitle": "Movie Title",
  "cinemaName": "Cinema Name",
  "roomName": "Room Name",
  "showtime": "2025-01-07T19:00:00.000Z",
  "reminderType": "day_before" // hoặc "12_hours_before"
}
```

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

### JavaScript/Node.js Example
```javascript
// Gửi thông báo thủ công
const sendManualReminder = async (showtimeId, reminderType) => {
  const response = await fetch('/api/scheduled-notifications/manual-reminder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      showtimeId,
      reminderType
    })
  });
  return response.json();
};

// Lấy thống kê
const getStats = async () => {
  const response = await fetch('/api/scheduled-notifications/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    }
  });
  return response.json();
};
```

### cURL Examples
```bash
# Gửi thông báo thủ công
curl -X POST http://localhost:3000/api/scheduled-notifications/manual-reminder \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": "showtime_id",
    "reminderType": "day_before"
  }'

# Lấy thống kê
curl -X GET http://localhost:3000/api/scheduled-notifications/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Monitoring và Debugging

### 1. Logs
Hệ thống sẽ log các hoạt động:
```
Starting scheduled notification tasks...
Sent day-before notification to user user_id for showtime showtime_id
Sent 12-hours-before notification to user user_id for showtime showtime_id
```

### 2. Kiểm tra trạng thái
- Sử dụng endpoint `/stats` để xem thống kê
- Kiểm tra logs server để debug
- Sử dụng `/restart` để khởi động lại nếu cần

### 3. Tùy chỉnh thời gian
Hiện tại hệ thống chạy mỗi 30 phút. Có thể thay đổi trong `ScheduledNotificationService`:
```typescript
// Thay đổi từ 30 phút thành 15 phút
const checkInterval = setInterval(() => {
  this.checkAndSendNotifications()
}, 15 * 60 * 1000) // 15 phút
```

## Lưu ý quan trọng

1. **Timezone**: Hệ thống sử dụng timezone của server
2. **Performance**: Kiểm tra mỗi 30 phút để tránh tải server
3. **Duplicate Prevention**: Tự động kiểm tra tránh gửi trùng lặp
4. **Error Handling**: Có xử lý lỗi và logging đầy đủ
5. **Admin Only**: Tất cả endpoints yêu cầu quyền admin
