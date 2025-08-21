# Valet Parking App Backend

## Setup
1. npm install
2. Edit .env with MONGO_URI and JWT_SECRET
3. npm start

## APIs
- Auth: /api/auth/register, /api/auth/login, /api/auth/forgot-password, /api/auth/reset-password
- Admin: /api/admin/pending-registrations, /api/admin/approve-user/:id, etc.
- Driver: /api/driver/incoming-requests, /api/driver/accept-request/:id, etc.
- Owner: /api/owner/add-vehicle, /api/owner/park-request, etc.
- Supervisor: /api/supervisor/parked-vehicles, /api/supervisor/add-unregistered-vehicle, etc.

## Notes
- Configure MongoDB (Atlas or local).
- Implement external integrations (Google Maps, Firebase Push) as needed.
- Use WebSockets for real-time notifications.
