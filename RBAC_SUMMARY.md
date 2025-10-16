# RBAC Implementation Summary

## ✅ Hoàn thành

### 1. Role System

- **File:** `src/common/roles.enum.ts`
- **Roles:** USER, ADMIN, SUPERADMIN
- **Default:** Mỗi user mới có role `['user']`

### 2. Custom Decorators

- **@Public()**: Bypass authentication (`src/common/decorators/public.decorator.ts`)
- **@Roles()**: Require specific roles (`src/common/decorators/roles.decorator.ts`)

### 3. Guards

- **JwtAuthGuard**: Verify JWT token (`src/common/guards/jwt-auth.guard.ts`)
  - Respects `@Public()` decorator
  - Injects `user` object to request
- **RolesGuard**: Check user roles (`src/common/guards/roles.guard.ts`)
  - Only active when `@Roles()` is used
  - Logic: `user.roles.includes(requiredRole)`

### 4. Global Registration

- **File:** `src/app.module.ts`
- Both guards registered with `APP_GUARD` provider
- Apply to ALL routes by default

### 5. User Entity Updates

- **File:** `src/users/entities/user.entity.ts`
- Added `roles` field (string[], default `['user']`)
- Added `is_email_verified`, `verification_token`, `verification_token_expires`

### 6. Auth Service Updates

- **File:** `src/auth/services/auth.service.ts`
- Register creates unverified user + sends email
- Login checks `is_email_verified = true`
- JWT payload includes `roles` array
- Added `verifyEmail()`, `resendVerificationEmail()`

### 7. Auth Controller Updates

- **File:** `src/auth/controllers/auth.controller.ts`
- All auth endpoints marked `@Public()`
- New endpoints: GET `/auth/verify-email`, POST `/auth/resend-verification`

### 8. Example Usage

- **File:** `src/workspaces/controllers/workspaces.controller.ts`
- `@Roles(Role.ADMIN)` on PATCH and DELETE endpoints
- Regular users can only view and create

### 9. Documentation

- **File:** `AUTH_GUIDE`
- Complete guide cho authentication flow
- RBAC usage examples
- Environment variables
- Troubleshooting tips

---

## 🔒 How It Works

```
Request → JwtAuthGuard → RolesGuard → Controller
          (check token)   (check roles)
```

### Example 1: Public route (no auth)

```typescript
@Public()
@Post('register')
register() {} // ✅ Anyone can access
```

### Example 2: Authenticated route (any logged-in user)

```typescript
@Get()
findAll() {} // ✅ Any user with valid JWT
```

### Example 3: Admin-only route

```typescript
@Roles(Role.ADMIN)
@Delete(':id')
remove() {} // ✅ Only ADMIN or SUPERADMIN
```

---

## 🧪 Testing Checklist

- [ ] Register new user → check email
- [ ] Verify email → should activate account
- [ ] Login without verifying → should fail (401)
- [ ] Login after verifying → should succeed
- [ ] Access protected route as USER → should succeed (if no @Roles)
- [ ] Access admin route as USER → should fail (403)
- [ ] Access admin route as ADMIN → should succeed

---

## 🎯 Quick Reference

| Decorator            | Purpose                     | Example                   |
| -------------------- | --------------------------- | ------------------------- |
| `@Public()`          | Skip authentication         | Register, Login endpoints |
| `@Roles(Role.ADMIN)` | Require ADMIN role          | Delete, sensitive updates |
| No decorator         | Require authentication only | Read operations           |

---

## 📦 Dependencies

- `@nestjs/jwt`: JWT token generation/validation
- `@nestjs-modules/mailer`: Email service
- `bcrypt`: Password hashing
- `class-validator`: DTO validation
- `typeorm`: Database ORM

---

## 🔐 Security Features

✅ Email verification required  
✅ Password hashing (bcrypt)  
✅ JWT expiration  
✅ Role-based authorization  
✅ Global guard protection  
✅ Custom decorators for fine-grained control

---

**Full documentation:** See `AUTH_GUIDE`
