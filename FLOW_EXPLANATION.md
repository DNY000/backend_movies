# 🚀 Luồng Chạy Backend Movies App

## 📋 Tổng Quan Luồng Chạy

```
1. Khởi động Server (main.ts)
   ↓
2. Kết nối Database
   ↓
3. Setup Middleware
   ↓
4. Setup Routes
   ↓
5. Xử lý Request
   ↓
6. Response
```

## 🔄 Chi Tiết Luồng Chạy

### 1. **Khởi Động Server (Entry Point)**
```typescript
// main.ts hoặc main.express.ts
import { MoviesApp } from './app';
const app = new MoviesApp();
app.start();
```

**Luồng:**
- Load environment variables (.env)
- Initialize Express application
- Setup middleware stack
- Connect to database
- Start HTTP server

### 2. **Request Flow (Khi có request đến)**

```
Client Request
     ↓
Express Server
     ↓
Middleware Stack
     ↓
Route Handler
     ↓
Controller
     ↓
Service
     ↓
Repository/Database
     ↓
Response
```

### 3. **Middleware Stack (Thứ tự xử lý)**

```typescript
// 1. Security middleware
app.use(helmet());

// 2. CORS middleware  
app.use(corsMiddleware);

// 3. Logging middleware
app.use(morgan('combined'));

// 4. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Routes
app.use(routes);

// 6. Error handling
app.use(notFoundHandler);
app.use(errorHandler);
```

### 4. **Route Processing**

```
GET /api/movies
     ↓
routes/index.ts
     ↓
movie.routes.ts
     ↓
MovieController.getAllMovies()
     ↓
MovieService.getAllMovies()
     ↓
MovieRepository.findAll()
     ↓
Database Query
     ↓
Response JSON
```

## 🏗️ Kiến Trúc Layers

### **1. Presentation Layer (Controllers)**
```typescript
// controllers/movie.controller.ts
export class MovieController {
  async getAllMovies(req: Request, res: Response) {
    // Handle HTTP request/response
    // Call service layer
    // Return JSON response
  }
}
```

### **2. Business Logic Layer (Services)**
```typescript
// services/movie.service.ts
export class MovieService {
  async getAllMovies(): Promise<Movie[]> {
    // Business logic
    // Call repository layer
    // Return processed data
  }
}
```

### **3. Data Access Layer (Repositories)**
```typescript
// database/repositories/movie.repository.ts
export class MovieRepository {
  async findAll(): Promise<Movie[]> {
    // Database queries
    // Data transformation
    // Return raw data
  }
}
```

## 🔄 Request Lifecycle

### **1. Incoming Request**
```
HTTP Request → Express Server → Middleware Stack
```

### **2. Route Matching**
```
URL: /api/movies
Method: GET
     ↓
routes/movie.routes.ts
     ↓
GET / → MovieController.getAllMovies
```

### **3. Controller Processing**
```typescript
async getAllMovies(req: Request, res: Response) {
  try {
    // 1. Extract request data
    const { page, limit } = req.query;
    
    // 2. Call service
    const movies = await this.movieService.getAllMovies();
    
    // 3. Return response
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    // 4. Error handling
    res.status(500).json({
      success: false,
      message: 'Error retrieving movies'
    });
  }
}
```

### **4. Service Layer**
```typescript
async getAllMovies(): Promise<Movie[]> {
  // 1. Business logic
  // 2. Validation
  // 3. Call repository
  return await this.movieRepository.findAll();
}
```

### **5. Repository Layer**
```typescript
async findAll(): Promise<Movie[]> {
  // 1. Database query
  // 2. Data transformation
  // 3. Return data
  return movies;
}
```

## 🛡️ Error Handling Flow

```
Error occurs
     ↓
Controller catches error
     ↓
Error middleware processes
     ↓
Formatted error response
     ↓
Client receives error
```

## 🔐 Authentication Flow

```
Request with JWT token
     ↓
auth.middleware.ts
     ↓
Verify JWT token
     ↓
Extract user info
     ↓
Add user to request
     ↓
Continue to controller
```

## 📊 Database Connection Flow

```
App starts
     ↓
DatabaseConnection.connect()
     ↓
MongoDB connection
     ↓
Connection established
     ↓
Server ready to handle requests
```

## 🚀 Startup Sequence

1. **Load Environment Variables**
2. **Initialize Express App**
3. **Setup Middleware**
4. **Connect Database**
5. **Setup Routes**
6. **Start HTTP Server**
7. **Ready to handle requests**

## 🔄 Request Processing Sequence

1. **Request arrives**
2. **Middleware processing**
3. **Route matching**
4. **Controller execution**
5. **Service layer processing**
6. **Repository data access**
7. **Response formatting**
8. **Client receives response**

## 📝 Logging Flow

```
Request → Morgan Logger → Console/File
Error → Error Logger → Console/File
```

## 🛠️ Development vs Production

### **Development:**
- Hot reload với nodemon
- Detailed error messages
- Console logging
- Debug mode

### **Production:**
- Optimized builds
- Error logging to files
- Security headers
- Performance monitoring
