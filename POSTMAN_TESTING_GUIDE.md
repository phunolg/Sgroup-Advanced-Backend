# Sgroup Backend - Postman Testing Guide 📘

## URL Cơ Bản (Base URL)

```
http://localhost:5000
```

## Các API Endpoints - Chi Tiết Đầy Đủ

### 1️⃣ REGISTER - Đăng ký tài khoản

**URL:** `POST http://localhost:5000/auth/register`

**JSON Body:**

```json
{
  "email": "testuser@gmail.com",
  "password": "Password123",
  "name": "Test User"
}
```

**Yêu cầu:**

- `email` (required): Email hợp lệ, chưa tồn tại
- `password` (required): Tối thiểu 6 ký tự
- `name` (required): Tên người dùng

**Response (201):**

```json
{
  "message": "Registration successful. Please verify your email.",
  "email": "testuser@gmail.com"
}
```

---

### 2️⃣ LOGIN - Đăng nhập

**URL:** `POST http://localhost:5000/auth/login`

**JSON Body:**

```json
{
  "email": "testuser@gmail.com",
  "password": "Password123"
}
```

**Yêu cầu:**

- `email` (required): Email đã đăng ký
- `password` (required): Mật khẩu chính xác

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "testuser@gmail.com",
    "name": "Test User"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

**Ghi chú:** Token được lưu tự động trong cookie (httpOnly)

---

### 3️⃣ VERIFY EMAIL - Xác thực email

**URL:** `GET http://localhost:5000/auth/verify-email?token=YOUR_TOKEN_FROM_EMAIL`

**Query Parameters:**

- `token` (required): Token từ email xác thực (gửi sau khi đăng ký)

**Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

**Ghi chú:**

- Link email sẽ có format: `http://your-app.com/verify?token=xxx`
- Token có hiệu lực 24 giờ

---

### 4️⃣ RESEND VERIFICATION EMAIL - Gửi lại email xác thực

**URL:** `POST http://localhost:5000/auth/resend-verification`

**JSON Body:**

```json
{
  "email": "testuser@gmail.com"
}
```

**Yêu cầu:**

- `email` (required): Email cần gửi lại xác thực

**Response (200):**

```json
{
  "message": "Verification email sent"
}
```

---

### 5️⃣ FORGOT PASSWORD - Quên mật khẩu

**URL:** `POST http://localhost:5000/auth/forgot-password`

**JSON Body:**

```json
{
  "email": "testuser@gmail.com"
}
```

**Yêu cầu:**

- `email` (required): Email đã đăng ký

**Response (200):**

```json
{
  "message": "If an account exists, password reset link sent"
}
```

**Ghi chú:**

- Email sẽ chứa link reset password (có hiệu lực 1 giờ)
- Link format: `http://your-app.com/reset-password?token=xxx`

---

### 6️⃣ VALIDATE RESET TOKEN - Kiểm tra token reset

**URL:** `GET http://localhost:5000/auth/reset-password?token=YOUR_RESET_TOKEN_FROM_EMAIL`

**Query Parameters:**

- `token` (required): Token từ email reset password

**Response (200):**

```json
{
  "valid": true,
  "message": "Token is valid"
}
```

**Response (400):**

```json
{
  "message": "Reset token has expired"
}
```

---

### 7️⃣ RESET PASSWORD - Đặt lại mật khẩu (Quên mật khẩu)

**URL:** `POST http://localhost:5000/auth/reset-password`

**JSON Body:**

```json
{
  "token": "YOUR_RESET_TOKEN_FROM_EMAIL",
  "new_password": "NewPassword456",
  "confirm_password": "NewPassword456"
}
```

**Yêu cầu:**

- `token` (required): Token từ email
- `new_password` (required): Mật khẩu mới, tối thiểu 6 ký tự
- `confirm_password` (required): Xác nhận mật khẩu mới (phải giống new_password)

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

**Lỗi có thể:**

- `"Passwords do not match"` - Hai mật khẩu không giống nhau
- `"Reset token has expired"` - Token đã hết hiệu lực
- `"Invalid reset token"` - Token không hợp lệ
- `"New password must be different from your current password"` - Mật khẩu mới giống cũ

---

### 8️⃣ REFRESH TOKEN - Làm mới access token

**URL:** `POST http://localhost:5000/auth/refresh`

**JSON Body:**

```json
{
  "refresh_token": "YOUR_REFRESH_TOKEN_FROM_LOGIN"
}
```

**Hoặc:** Gửi refresh_token qua Cookie (tự động nếu đã login)

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

---

### 9️⃣ UPDATE PASSWORD - Thay đổi mật khẩu (Đã đăng nhập)

**URL:** `PUT http://localhost:5000/auth/password`

**Headers:**

```
Content-Type: application/json
Cookie: access_token=YOUR_ACCESS_TOKEN
```

**JSON Body:**

```json
{
  "current_password": "Password123",
  "new_password": "NewPassword789",
  "confirm_password": "NewPassword789"
}
```

**Yêu cầu:**

- `current_password` (required): Mật khẩu hiện tại
- `new_password` (required): Mật khẩu mới, tối thiểu 6 ký tự
- `confirm_password` (required): Xác nhận mật khẩu mới

**Response (200):**

```json
{
  "message": "Password updated successfully"
}
```

**Lỗi có thể:**

- `"User not authenticated"` - Chưa đăng nhập (Status 401)
- `"Passwords do not match"` - Hai mật khẩu mới không giống (Status 400)
- `"Invalid current password"` - Mật khẩu hiện tại sai (Status 400)
- `"Password must be at least 6 characters"` - Mật khẩu quá ngắn (Status 400)
- `"New password must be different from your current password"` - Giống mật khẩu cũ (Status 400)

---

### 🔟 LOGOUT - Đăng xuất

**URL:** `POST http://localhost:5000/auth/logout`

**JSON Body:**

```json
{}
```

**Response (200):**

```json
{
  "message": "Logged out"
}
```

---

## 📋 Quy Trình Test Hoàn Chỉnh

### **A. Test Đăng Ký & Xác Thực Email**

1. ✅ POST `http://localhost:5000/auth/register`
   - Dữ liệu: `{ "email": "test123@gmail.com", "password": "Pass123", "name": "Test" }`
   - Kiểm tra: Email nhận được xác thực
2. ✅ GET `http://localhost:5000/auth/verify-email?token=[token từ email]`
   - Kiểm tra: Email được xác thực thành công
3. ✅ POST `http://localhost:5000/auth/login`
   - Dữ liệu: `{ "email": "test123@gmail.com", "password": "Pass123" }`
   - Kiểm tra: Login thành công, nhận token

### **B. Test Quên Mật Khẩu**

1. ✅ POST `http://localhost:5000/auth/forgot-password`
   - Dữ liệu: `{ "email": "test123@gmail.com" }`
   - Kiểm tra: Email reset được gửi
2. ✅ GET `http://localhost:5000/auth/reset-password?token=[token từ email]`
   - Kiểm tra: Token hợp lệ
3. ✅ POST `http://localhost:5000/auth/reset-password`
   - Dữ liệu: `{ "token": "...", "new_password": "NewPass456", "confirm_password": "NewPass456" }`
   - Kiểm tra: Reset thành công
4. ✅ POST `http://localhost:5000/auth/login`
   - Dữ liệu: `{ "email": "test123@gmail.com", "password": "NewPass456" }`
   - Kiểm tra: Login với mật khẩu mới

### **C. Test Thay Đổi Mật Khẩu (Đã Đăng Nhập)**

1. ✅ POST `http://localhost:5000/auth/login`
   - Dữ liệu: `{ "email": "test123@gmail.com", "password": "NewPass456" }`
   - Kiểm tra: Login thành công, lấy access_token
2. ✅ PUT `http://localhost:5000/auth/password`
   - Headers: `Cookie: access_token=YOUR_TOKEN`
   - Dữ liệu: `{ "current_password": "NewPass456", "new_password": "FinalPass789", "confirm_password": "FinalPass789" }`
   - Kiểm tra: Mật khẩu thay đổi thành công
3. ✅ POST `http://localhost:5000/auth/login`
   - Dữ liệu: `{ "email": "test123@gmail.com", "password": "FinalPass789" }`
   - Kiểm tra: Login với mật khẩu mới

---

## 🔐 Cách Gửi Access Token trong Postman

### **Cách 1: Sử dụng Cookie (Khuyên dùng)**

1. Sau khi login, token tự động lưu trong cookie
2. Các request tiếp theo sẽ tự động gửi cookie
3. Trong Postman, header sẽ có: `Cookie: access_token=xxx`

### **Cách 2: Sử dụng Environment Variable (Variables)**

1. Vào tab `Variables` trong Postman
2. Tạo biến: `access_token` = giá trị token từ response login
3. Sử dụng trong header: `{{access_token}}`

### **Cách 3: Sử dụng Authorization Header**

```
Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📥 Cách Import vào Postman

1. Mở Postman
2. Click `File` → `Import`
3. Chọn file `POSTMAN_AUTH_API.json`
4. Postman sẽ tự động import tất cả endpoints

---

## ✅ Checklist Kiểm Tra

- [ ] Server chạy trên `http://localhost:5000`
- [ ] Database đã migrate (reset password fields)
- [ ] Mail service cấu hình (SMTP Gmail)
- [ ] Import collection vào Postman
- [ ] Test Register → Login → Update Password → Logout
- [ ] Kiểm tra email nhận được (verification, reset, notification)
- [ ] Lỗi validation xử lý đúng cách

---

## 🐛 Troubleshooting

| Vấn Đề                             | Giải Pháp                                          |
| ---------------------------------- | -------------------------------------------------- |
| `ECONNREFUSED: Connection refused` | Kiểm tra server chạy: `pnpm start:dev`             |
| `Email not found`                  | Kiểm tra database, đảm bảo user tồn tại            |
| `Invalid token`                    | Token đã hết hiệu lực, yêu cầu reset mới           |
| `Password do not match`            | Kiểm tra confirm_password giống new_password       |
| `Email not sending`                | Kiểm tra .env: MAIL_HOST, MAIL_USER, MAIL_PASSWORD |

---

**File Collection:** `POSTMAN_AUTH_API.json`
**Cập nhật lần cuối:** November 14, 2025
