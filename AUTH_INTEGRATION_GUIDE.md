# Authentication Integration Guide

## ✅ Pre-Flight Checklist

### 1. Environment Variables (.env)

```env
# Backend URLs
VITE_API_TEST_URL=http://localhost:5000
VITE_AWS_API_BASE_URL=https://your-production-api.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 2. Google Sign-In Setup

Add this script to your `index.html` in the `<head>` section:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 3. Backend Endpoints Required

Your backend must have these endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password/:token` - Reset password with token

---

## 📋 Backend Response Format

### Registration Response

```json
{
  "success": true,
  "message": "Registration successful. Please login.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### Login/Google Sign-In Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "https://...",
      "authProvider": "email|google|hybrid"
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "message": "Detailed error message"
}
```

---

## 🔐 Token Storage Strategy

### Storage Locations

1. **Access Token**: `localStorage.setItem('auth_token', token)`
2. **Refresh Token**: `localStorage.setItem('refresh_token', token)`
3. **User Profile**: `localStorage.setItem('user_profile', JSON.stringify(user))`

### Memory Cache

- Tokens are also stored in memory for faster access
- Prevents unnecessary localStorage reads on every request

### Security Notes

- ✅ Tokens are sent as `Authorization: Bearer <token>` header
- ✅ 401 responses automatically clear auth and redirect to login
- ✅ Tokens persist across page refreshes
- ⚠️ localStorage is vulnerable to XSS - ensure your app has proper CSP headers

---

## 🚀 Usage Examples

### Check if User is Authenticated

```javascript
import {
  isAuthenticated,
  getToken,
  getStoredUserProfile,
} from "./services/authService";

// Simple check
if (isAuthenticated()) {
  console.log("User is logged in");
}

// Get current token
const token = getToken();

// Get user profile
const user = getStoredUserProfile();
console.log(user.name, user.email);
```

### Manual Logout

```javascript
import { clearAuth } from "./services/authService";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Protected API Calls

```javascript
import api from "./services/api";

// Token is automatically attached by axios interceptor
async function getUserData() {
  const response = await api.get("/api/user/profile");
  return response.data;
}
```

---

## 🐛 Testing Checklist

### Registration Flow

- [ ] Can register with valid email/password
- [ ] Shows error for invalid email format
- [ ] Shows error for weak password (< 8 chars)
- [ ] Shows error for duplicate email
- [ ] Auto-logs in after successful registration
- [ ] Redirects to dashboard after registration

### Login Flow

- [ ] Can login with correct credentials
- [ ] Shows error for incorrect password
- [ ] Shows error for non-existent email
- [ ] "Forgot Password" link works
- [ ] Token persists after page refresh
- [ ] Redirects to dashboard after login

### Google Sign-In

- [ ] Google button renders correctly
- [ ] Can sign in with Google account
- [ ] Creates new user if doesn't exist
- [ ] Logs in existing user
- [ ] Token persists after page refresh
- [ ] Redirects to dashboard after sign-in

### Password Reset

- [ ] Forgot password sends email
- [ ] Reset link redirects to reset page
- [ ] Can set new password
- [ ] Shows error for expired token
- [ ] Shows error for mismatched passwords
- [ ] Redirects to login after successful reset

### Protected Routes

- [ ] Unauthenticated users redirected to landing page
- [ ] Authenticated users can access dashboard
- [ ] Token checked on route change
- [ ] Shows loading spinner during auth check
- [ ] 401 responses log user out automatically

### Token Management

- [ ] Token stored in localStorage
- [ ] Token sent with API requests
- [ ] Token cleared on logout
- [ ] Token cleared on 401 response
- [ ] Token persists across page refresh

---

## 🔧 Troubleshooting

### Google Sign-In Not Working

1. Check `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. Verify Google script is loaded in `index.html`
3. Check browser console for errors
4. Ensure domain is authorized in Google Console

### Token Not Persisting

1. Check localStorage in DevTools → Application → Local Storage
2. Verify `auth_token` key exists
3. Check for CORS issues in Network tab
4. Ensure backend returns `accessToken` in response

### 401 Redirects Not Working

1. Check axios interceptor in `api.js`
2. Verify backend returns 401 status code
3. Check browser console for errors
4. Test with expired token

### Backend Not Responding

1. Check `API_BASE_URL` in DevTools console
2. Verify backend is running
3. Check CORS settings on backend
4. Test API with Postman/Insomnia

---

## 📱 Mobile Considerations

- Design is mobile-first
- Touch-friendly buttons (min 44px height)
- Drawers slide from bottom on mobile
- Responsive text sizing
- Optimized image loading with preloading

---

## 🎯 Production Deployment

### Frontend (.env.production)

```env
VITE_AWS_API_BASE_URL=https://your-production-api.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend Environment

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Headers (Backend)

```javascript
// Express.js example
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```

---

## 📊 Performance Optimizations

✅ **Implemented:**

- Lazy loading for all route components
- Image preloading for carousel
- Memoized callbacks in embla carousel
- Axios instance with shared config
- Memory cache for tokens

🎯 **Future Enhancements:**

- Token refresh mechanism
- Remember me functionality
- Biometric authentication
- Session timeout warnings

---

## 🆘 Support

If issues persist:

1. Check all files are copied correctly
2. Verify `.env` variables are set
3. Clear browser cache and localStorage
4. Test backend endpoints with Postman
5. Check browser console for errors

**Common Gotchas:**

- Forgot to add Google script to `index.html`
- Wrong API URL in `.env`
- CORS not configured on backend
- Google Client ID mismatch
- Backend not returning correct response format
