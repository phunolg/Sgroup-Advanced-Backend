# Postman - Hướng Dẫn Setup Authentication 🔐

## Cách Gửi Access Token trong Postman cho Endpoint `PUT /auth/password`

---

## ⭐ **Cách 1: Headers (Cookie) - KHUYÊN DÙNG**

### **Bước 1: Login để lấy Token**

1. Gọi endpoint: `POST http://localhost:5000/auth/login`
2. Body:

```json
{
  "email": "testuser@gmail.com",
  "password": "Password123"
}
```

3. Response sẽ tự động lưu cookie:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 900
}
```

### **Bước 2: Gửi Request với Cookie**

**Trong Postman:**

1. Mở tab `PUT http://localhost:5000/auth/password`
2. Vào tab **Headers**
3. Postman sẽ **tự động** thêm:

   ```
   Cookie | access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Thêm header: `Content-Type: application/json`

5. **Tab Body** → Raw → JSON:

```json
{
  "current_password": "Password123",
  "new_password": "NewPassword789",
  "confirm_password": "NewPassword789"
}
```

6. Click **Send**

**Kết quả:**

```json
{
  "message": "Password updated successfully"
}
```

---

## **Cách 2: Authorization Type = Bearer Token**

### **Khi nào dùng?**

- Khi backend yêu cầu header: `Authorization: Bearer TOKEN`
- Endpoint này **KHÔNG** cần, nhưng có thể dùng

### **Trong Postman:**

1. Tab **Authorization**
2. Dropdown `Type` → Chọn **Bearer Token**
3. Token field: Paste access token

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Postman sẽ tự động thêm header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Lưu ý:** Endpoint này **không** dùng Bearer Token, nó dùng Cookie!

---

## **Cách 3: Authorization Type = API Key**

### **Khi nào dùng?**

- Khi backend yêu cầu key trong header
- Endpoint này **KHÔNG** cần, nhưng đây là thay thế

### **Trong Postman:**

1. Tab **Authorization**
2. Dropdown `Type` → Chọn **API Key**
3. Cấu hình:
   - Key: `Cookie`
   - Value: `access_token=YOUR_TOKEN`
   - Add to: `Header`

**Lưu ý:** Cách này thủ công và không được khuyên dùng

---

## **Cách 4: Environment Variables (Nên dùng trong dự án lớn)**

### **Bước 1: Tạo Environment**

1. Postman → Top Right → **No Environment** → **Create**
2. Name: `Sgroup-Dev`
3. Add variable:
   ```
   Variable: access_token
   Initial Value: (để trống)
   Current Value: (để trống)
   ```

### **Bước 2: Auto-set Token sau Login**

**Endpoint Login:**

1. Tab **Tests** (dưới Body)
2. Paste code:

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set('access_token', jsonData.access_token);
}
```

3. Sau khi gọi login, token sẽ tự động lưu vào environment

### **Bước 3: Dùng Token trong Request**

**Headers Tab:**

```
Content-Type | application/json
Cookie | access_token={{access_token}}
```

**Kết quả:** Postman sẽ thay `{{access_token}}` bằng giá trị thực

---

## 📋 **So Sánh 4 Cách**

| Cách             | Auth Type    | Cấu Hình          | Dễ Dùng    | Khuyên |
| ---------------- | ------------ | ----------------- | ---------- | ------ |
| **1: Cookie**    | None         | Headers tự động   | ⭐⭐⭐⭐⭐ | ✅     |
| **2: Bearer**    | Bearer Token | Authorization tab | ⭐⭐⭐     | ❌     |
| **3: API Key**   | API Key      | Authorization tab | ⭐⭐       | ❌     |
| **4: Variables** | None         | Headers + Tests   | ⭐⭐⭐⭐   | ✅     |

---

## 🎯 **Chi Tiết Cách 1 (Cookie) - BẠN NÊN DÙNG**

### **Headers Setup:**

```
Tab: Headers

| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Cookie | access_token=YOUR_TOKEN_HERE |
```

### **Hoặc Tự Động (Khuyên dùng):**

Sau khi login, cookie **tự động** lưu. Postman sẽ gửi nó tự động cho mọi request.

---

## ✅ **Hướng Dẫn Từng Bước (Dễ Nhất)**

### **Bước 1: Mở Postman**

```
New Tab → PUT http://localhost:5000/auth/password
```

### **Bước 2: Login trước (lấy token)**

```
New Tab → POST http://localhost:5000/auth/login
Body:
{
  "email": "testuser@gmail.com",
  "password": "Password123"
}
Send
```

Kết quả:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  ...
}
```

### **Bước 3: Quay lại tab PUT /password**

**Headers Tab:**

- Content-Type: application/json
- Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

(Postman sẽ nhớ cookie từ login, có thể tự động thêm)

### **Bước 4: Body (Raw JSON)**

```json
{
  "current_password": "Password123",
  "new_password": "NewPassword789",
  "confirm_password": "NewPassword789"
}
```

### **Bước 5: Send**

**Kết quả thành công (200):**

```json
{
  "message": "Password updated successfully"
}
```

---

## 🔍 **Kiểm Tra Token trong Postman**

### **Xem Token từ Response:**

1. Login → Response
2. Tìm `access_token` value
3. Copy giá trị

### **Decode Token (tùy chọn):**

1. https://jwt.io
2. Paste token
3. Xem payload

---

## 🐛 **Lỗi Thường Gặp & Giải Pháp**

| Lỗi                              | Nguyên Nhân                     | Giải Pháp                             |
| -------------------------------- | ------------------------------- | ------------------------------------- |
| `401 Unauthorized`               | Token không hợp lệ hoặc hết hạn | Login lại để lấy token mới            |
| `Cookie: access_token=undefined` | Chưa login                      | Gọi login trước rồi copy token        |
| `Content-Type error`             | Header thiếu Content-Type       | Thêm `Content-Type: application/json` |
| `Passwords do not match`         | new_password ≠ confirm_password | Kiểm tra 2 mật khẩu mới giống nhau    |
| `Invalid current password`       | current_password sai            | Kiểm tra mật khẩu hiện tại            |

---

## 📝 **Tóm Tắt - Cách Làm Nhanh Nhất**

```
1️⃣ POST /auth/login
   {email, password}
   → Lấy access_token

2️⃣ PUT /auth/password
   Headers: Cookie: access_token=TOKEN
   Body: {current_password, new_password, confirm_password}
   → Thay đổi mật khẩu thành công ✅
```

---

**Ghi chú:**

- `Authorization` Type trong Postman **KHÔNG** cần cho endpoint này
- Cookie được lưu **tự động** sau khi login
- Bạn chỉ cần thêm vào Headers hoặc để Postman tự động thêm
