# 🔧 Complete User Management Guide

## 🎯 Overview
This guide gives you **complete control** over the user database. You can manage users directly through API endpoints or use database commands.

> **Note on host and port.** The `curl` examples below assume the backend
> listens on `http://localhost:8000`, which is the default in
> `Guides/DEV_SETUP.md`. In production, or in a coexistence setup where
> gunicorn is bound to a different port (see `Guides/PROD_SETUP.md`),
> substitute your actual backend host and port.

## 🚀 API Endpoints (Recommended)

### 1. List All Users
**GET** `/api/users/`

```bash
curl -X GET http://localhost:8000/api/users/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "is_active": true,
        "is_superuser": true,
        "date_joined": "2024-01-05T12:22:00Z"
      }
    ],
    "count": 1
  }
}
```

### 2. Delete Specific User
**DELETE** `/api/users/<email>/`

```bash
curl -X DELETE http://localhost:8000/api/users/admin@example.com/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "User admin (admin@example.com) deleted successfully",
    "deleted_user": {
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

### 3. Delete ALL Users (DANGEROUS!)
**DELETE** `/api/users/all/`

```bash
curl -X DELETE http://localhost:8000/api/users/all/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Deleted ALL 3 users from the system",
    "deleted_count": 3
  }
}
```

### 4. Reset User Password
**POST** `/api/users/reset-password/`

```bash
curl -X POST http://localhost:8000/api/users/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "newpassword123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset for admin@example.com",
    "username": "admin",
    "email": "admin@example.com",
    "new_password": "newpassword123"
  }
}
```

## 🗃️ Direct Database Commands

### Connect to PostgreSQL
```bash
PGPASSWORD='password' psql -U regulatory_user -h localhost -d regulatory_db
```

### List All Users
```sql
SELECT id, username, email, is_active, is_superuser, date_joined FROM auth_user;
```

### Delete Specific User
```sql
DELETE FROM auth_user WHERE email = 'admin@example.com';
```

### Delete ALL Users
```sql
DELETE FROM auth_user;
```

### Reset User Password
```sql
UPDATE auth_user SET password = 'pbkdf2_sha256$600000$test$test' WHERE email = 'admin@example.com';
```

### Count Users
```sql
SELECT COUNT(*) FROM auth_user;
```

## 🔄 Complete Reset Process

### Step 1: Delete Your User
```bash
curl -X DELETE http://localhost:8000/api/users/admin@example.com/
```

### Step 2: Verify Deletion
```bash
curl -X GET http://localhost:8000/api/users/
```

### Step 3: Register Fresh Account
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "morinf", "email": "admin@example.com", "password": "yournewpassword", "company": "TUM"}'
```

### Step 4: Login with New Credentials
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "yournewpassword"}'
```

## 🛡️ Security Notes

1. **Backup Important**: These operations are irreversible
2. **Test First**: Try with test accounts before your main account
3. **Password Security**: Use strong passwords for production
4. **Database Access**: Keep database credentials secure

## 🎯 Verification Commands

### Check if User Exists
```bash
PGPASSWORD='password' psql -U regulatory_user -h localhost -d regulatory_db -c "SELECT username, email FROM auth_user WHERE email = 'admin@example.com';"
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "yourpassword"}'
```

## 📋 Troubleshooting

### "User not found" Error
- User was already deleted or doesn't exist
- Check spelling of email address
- Verify user exists with `GET /api/users/`

### "Invalid email or password" Error
- Password doesn't match what's in database
- User exists but password is incorrect
- Reset password with `POST /api/users/reset-password/`

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `backend/settings.py`
- Verify network connectivity to database

## 🎉 You Have Complete Control

You can now:
- ✅ **Delete your account** and start fresh
- ✅ **Reset passwords** for any user
- ✅ **List all users** to see who exists
- ✅ **Delete all users** for complete reset
- ✅ **Verify everything works** from scratch

**The system is now fully under your control!** 🚀