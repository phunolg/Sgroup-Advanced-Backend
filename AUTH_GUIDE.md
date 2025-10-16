# Authentication & Authorization Guide

## Tổng quan

Hệ thống authentication và authorization được xây dựng với:

- JWT-based authentication
- Email verification flow
- Role-based access control (RBAC)
- Global guards với custom decorators

---

## 1. Email Verification Flow

### 1.1. Register (Đăng ký)

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response:**

```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "email": "user@example.com"
}
```

**Flow:**

1. Người dùng gửi thông tin đăng ký
2. Hệ thống tạo user với `is_email_verified = false`
3. Tạo verification token (32 bytes random, expires in 24h)
4. Gửi email verification với link chứa token
5. Return message yêu cầu verify email (KHÔNG login tự động)

---

### 1.2. Verify Email (Xác thực email)

**Endpoint:** `GET /api/auth/verify-email?token=abc123...`

**Response:**

```json
{
  "message": "Email verified successfully! You can now log in."
}
```

**Flow:**

1. User click link trong email
2. Hệ thống check token validity và expiration
3. Nếu valid: set `is_email_verified = true`, xóa token
4. Nếu expired/invalid: return error 400
5. User có thể login sau khi verify thành công

---

### 1.3. Resend Verification Email

**Endpoint:** `POST /api/auth/resend-verification`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Verification email sent! Please check your inbox."
}
```

**Use case:** User không nhận được email hoặc token đã hết hạn

---

### 1.4. Login (Đăng nhập)

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "roles": ["user"]
  }
}
```

**Flow:**

1. User gửi email + password
2. Hệ thống check credentials
3. **Check `is_email_verified = true`** (nếu false → return 401)
4. Generate JWT với payload: `{ sub: userId, email, roles }`
5. Return access_token + refresh_token

---

## 2. Role-Based Access Control (RBAC)

### 2.1. Available Roles

```typescript
export enum Role {
  USER = 'user', // Người dùng thông thường
  ADMIN = 'admin', // Quản trị viên
  SUPERADMIN = 'superadmin', // Quản trị cấp cao
}
```

**Default:** Mỗi user khi register sẽ có role `['user']`

---

### 2.2. Global Guards

Hệ thống sử dụng 2 global guards được đăng ký trong `app.module.ts`:

#### **JwtAuthGuard**

- Kiểm tra JWT token trong header `Authorization: Bearer <token>`
- Validate token với `JWT_SECRET`
- Inject user object vào `request.user`
- Có thể bypass bằng decorator `@Public()`

#### **RolesGuard**

- Kiểm tra roles của user so với yêu cầu của endpoint
- Chỉ active khi endpoint có decorator `@Roles()`
- Check: `user.roles.includes(requiredRole)`

---

### 2.3. Custom Decorators

#### **@Public()**

Bypass authentication cho endpoint không yêu cầu đăng nhập:

```typescript
@Public()
@Post('register')
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

**Use case:** register, login, verify-email, refresh-token

---

#### **@Roles(...roles: Role[])**

Yêu cầu user phải có ít nhất 1 trong các roles được chỉ định:

```typescript
@Roles(Role.ADMIN)
@Patch(':id')
async update(@Param('id') id: string, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

**Logic:** `requiredRoles.some(role => user.roles.includes(role))`

---

### 2.4. Ví dụ thực tế

**WorkspacesController:**

```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@Controller('api/workspaces')
export class WorkspacesController {
  // ✅ Tất cả user đã login đều có thể tạo workspace
  @Post()
  create(@Body() dto: CreateWorkspaceDto) {
    return this.service.create(dto);
  }

  // ✅ Tất cả user đã login đều có thể xem danh sách
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // 🔒 CHỈ ADMIN hoặc SUPERADMIN mới có thể update
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.service.update(id, dto);
  }

  // 🔒 CHỈ ADMIN hoặc SUPERADMIN mới có thể delete
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

---

### 2.5. Testing RBAC

#### **Test case 1: User với role 'user' cố update workspace**

Request:

```bash
PATCH /api/workspaces/123
Authorization: Bearer <user_token>
Body: { "name": "New Name" }
```

Response: **403 Forbidden**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

#### **Test case 2: User với role 'admin' update workspace**

Request:

```bash
PATCH /api/workspaces/123
Authorization: Bearer <admin_token>
Body: { "name": "New Name" }
```

Response: **200 OK**

```json
{
  "id": "123",
  "name": "New Name",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

---

## 3. Environment Variables

Add vào file `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRATION=7d

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@yourapp.com
MAIL_FROM_NAME=Your App Name

# Application URL (for verification links)
APP_URL=http://localhost:3000
```

**Lưu ý:** Nếu dùng Gmail, cần tạo [App Password](https://support.google.com/accounts/answer/185833)

---

## 4. Database Schema

**User Entity Fields:**

```typescript
{
  id: uuid,
  email: string (unique),
  password: string (hashed),
  full_name: string,
  is_email_verified: boolean (default false),
  verification_token: string (nullable),
  verification_token_expires: Date (nullable),
  roles: string[] (default ['user']),
  created_at: Date,
  updated_at: Date
}
```

---

## 5. Common Scenarios

### 5.1. Thêm role ADMIN cho user

**Manual (via database):**

```sql
UPDATE "user"
SET roles = ARRAY['user', 'admin']
WHERE email = 'admin@example.com';
```

**TODO:** Tạo endpoint cho SUPERADMIN quản lý roles

---

### 5.2. Reset password flow

**TODO:** Implement similar to email verification:

1. POST /auth/forgot-password → send reset link
2. GET /auth/reset-password?token=xxx → verify token
3. POST /auth/reset-password → update password

---

### 5.3. Multiple roles cho 1 user

User có thể có nhiều roles:

```typescript
roles: ['user', 'admin'];
```

`@Roles(Role.ADMIN)` sẽ pass nếu user có BẤT KỲ role nào trong yêu cầu.

---

## 6. Security Best Practices

✅ **Đã implement:**

- Password hashing với bcrypt (10 rounds)
- JWT expiration (1h cho access_token)
- Email verification bắt buộc trước khi login
- Verification token expires in 24h
- Global authentication guards
- Role-based authorization

⚠️ **Nên thêm:**

- Rate limiting cho register/login endpoints
- CSRF protection
- Helmet middleware cho security headers
- Input sanitization
- Account lockout sau X failed login attempts
- 2FA (Two-factor authentication)

---

## 7. Troubleshooting

### "User not found or email not verified"

→ Check `is_email_verified` field trong database, verify email trước khi login

### "Forbidden resource" (403)

→ User không có đủ roles, check `user.roles` và yêu cầu của endpoint

### "Unauthorized" (401)

→ Token invalid/expired hoặc endpoint không có `@Public()` mà chưa login

### Email không gửi được

→ Check MAIL_HOST, MAIL_USER, MAIL_PASSWORD trong .env

---

## 8. API Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                    │
└──────────────────────────────────────────────────────────┘

1. Register
   POST /auth/register
   ↓
   ┌─────────────────┐
   │ Create User     │
   │ verified: false │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │ Send Email with │
   │ Verification    │
   │ Token           │
   └─────────────────┘

2. Verify Email
   GET /auth/verify-email?token=xxx
   ↓
   ┌─────────────────┐
   │ Set verified:   │
   │ true            │
   └─────────────────┘

3. Login
   POST /auth/login
   ↓
   ┌─────────────────┐
   │ Check verified  │
   │ = true          │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │ Generate JWT    │
   │ with roles      │
   └─────────────────┘

4. Access Protected Route
   GET /api/workspaces
   Authorization: Bearer <token>
   ↓
   ┌─────────────────┐
   │ JwtAuthGuard    │
   │ validates token │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │ RolesGuard      │
   │ checks roles    │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │ Allow Access    │
   └─────────────────┘
```

---

## 9. Next Steps

- [ ] Test complete flow: register → verify → login → access protected routes
- [ ] Add admin panel để quản lý user roles
- [ ] Implement password reset flow
- [ ] Add rate limiting
- [ ] Add 2FA option
- [ ] Create E2E tests cho authentication flow
- [ ] Add Swagger authentication bearer button

---

**Questions?** Check `/src/auth/`, `/src/common/guards/`, `/src/common/decorators/`
