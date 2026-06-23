# Admin Dashboard Implementation Plan

## Project Analysis Summary

### Current Architecture
- **Backend**: Spring Boot 3.5.15 with MySQL database
- **Frontend**: React with Vite
- **Key Entities**: User, GovService, UserProgress, Document, FileRecord, RejectionReason
- **Authentication**: JWT-based with Role-based access control

### Existing User Roles
- **CITIZEN**: Regular users applying for services
- **Need to add**: ADMIN role for administrative functions

---

## Required Implementations

### 1. DATABASE CHANGES

#### A. Enhance User Table
**Current Status**: User table exists with fields: id, name, email, mobile, password, role

**Changes Required**:
```sql
-- The role field already exists, ensure it supports 'ADMIN' role
-- No additional changes needed for User table
```

#### B. Create ServiceApplication Table (NEW)
**Purpose**: Track user applications for services with application status and admin notes

```sql
CREATE TABLE service_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_notes VARCHAR(2000),
    rejection_reason VARCHAR(2000),
    certificate_file_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (certificate_file_id) REFERENCES file_records(id),
    INDEX idx_status (status),
    INDEX idx_user_service (user_id, service_id),
    INDEX idx_application_date (application_date)
);
```

**Status Values**: `PENDING`, `IN_PROGRESS`, `APPROVED`, `REJECTED`

#### C. Enhance FileRecord Table
**Current Status**: FileRecord table exists with file metadata

**Changes Required**:
```sql
ALTER TABLE file_records ADD COLUMN file_type VARCHAR(50) DEFAULT 'USER_UPLOAD';
-- file_type values: 'USER_UPLOAD', 'CERTIFICATE', 'ADMIN_DOCUMENT'
```

#### D. Update RejectionReason Table
**Current Status**: RejectionReason exists with generic reason text

**Changes Required**:
```sql
-- Add relationship to ServiceApplication
ALTER TABLE rejection_reasons 
ADD COLUMN application_id BIGINT,
ADD COLUMN created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD FOREIGN KEY (application_id) REFERENCES service_applications(id) ON DELETE CASCADE;
```

---

### 2. BACKEND CHANGES (Spring Boot)

#### A. New Models/Entities

**1. ServiceApplication.java** (NEW)
```
Location: src/main/java/com/govgps/model/ServiceApplication.java
- id (Long)
- userId (Long) - references User
- serviceId (Long) - references GovService
- status (String) - PENDING, IN_PROGRESS, APPROVED, REJECTED
- applicationDate (LocalDateTime)
- updatedDate (LocalDateTime)
- adminNotes (String)
- rejectionReason (String)
- certificateFileId (Long) - references FileRecord
- userEntity (User) - JPA relationship
- serviceEntity (GovService) - JPA relationship
```

#### B. New DTOs/Request Objects

**1. ServiceApplicationDTO.java** (NEW)
- For API responses with user and service details

**2. ApplicationStatusUpdateRequest.java** (NEW)
```
- status (String) - required
- adminNotes (String) - optional
- rejectionReason (String) - optional if status = REJECTED
```

**3. AdminDashboardStatsDTO.java** (NEW)
```
- totalApplications (int)
- pendingApplications (int)
- approvedApplications (int)
- rejectedApplications (int)
- inProgressApplications (int)
```

#### C. New Repositories

**1. ServiceApplicationRepository.java**
```java
- findByUserId(Long userId)
- findByServiceId(Long serviceId)
- findByStatus(String status)
- findAll() - with pagination
- countByStatus(String status)
```

#### D. New Controllers

**1. AdminController.java** (NEW)
```
Endpoints:
- GET /api/admin/dashboard/stats - Get dashboard statistics
- GET /api/admin/applications - List all applications with filtering
- GET /api/admin/applications/{id} - Get application details
- PUT /api/admin/applications/{id}/status - Update application status
- POST /api/admin/applications/{id}/certificate - Upload certificate
- GET /api/admin/users - List all users
- GET /api/admin/services - List all services
- DELETE /api/admin/applications/{id} - Delete application
```

**2. ServiceApplicationController.java** (NEW)
```
Endpoints:
- POST /api/applications - User submits service application
- GET /api/applications/{userId} - User views their applications
- GET /api/applications/{id}/documents - User views uploaded documents
```

**3. AdminFileController.java** (NEW)
```
Endpoints:
- GET /api/admin/files/{fileId}/download - Download file
- GET /api/admin/applications/{appId}/files - List files for application
```

#### E. New Services

**1. ServiceApplicationService.java** (NEW)
- Business logic for application management
- Validation
- Status transition logic
- Filtering and pagination

**2. AdminFileService.java** (NEW)
- File download logic
- File validation
- Certificate upload handling

#### F. Update Existing Files

**1. AuthController.java** - MODIFY
- Update login endpoint to return user role
- Add role validation for admin access

**2. FileUploadController.java** - MODIFY
- Add certificate upload endpoint
- Enhance file type tracking

---

### 3. FRONTEND CHANGES (React)

#### A. New Pages

**1. AdminDashboard.jsx** (NEW)
```
Location: src/pages/AdminDashboard.jsx
Components:
- Dashboard header with statistics
- Applications table/list
- Filtering options (status, date range)
- Pagination controls
```

**2. AdminLogin.jsx** (NEW)
```
Location: src/pages/AdminLogin.jsx
- Separate login for admin users
- Role-based routing
```

**3. AdminApplicationDetail.jsx** (NEW)
```
Location: src/pages/AdminApplicationDetail.jsx
Components:
- Application details
- User information
- Uploaded documents with download
- Status update form
- Rejection reason form (if rejecting)
- Certificate upload form (if approving)
```

**4. AdminFileViewer.jsx** (NEW)
```
Location: src/pages/AdminFileViewer.jsx
- Preview/download user uploaded files
- File metadata display
```

#### B. New Components

**1. ApplicationsList.jsx** (NEW)
- Reusable component for displaying applications table
- Filtering, sorting, pagination

**2. StatusBadge.jsx** (NEW)
- Visual status indicator component

**3. FileUploadZone.jsx** (MODIFY/ENHANCE)
- Add certificate upload functionality
- Drag-and-drop support

**4. AdminNav.jsx** (NEW)
- Admin-specific navigation

#### C. Modify Existing Components

**1. Header.js** - ADD
- Admin section in navigation
- Role-based menu items

**2. App.jsx** - MODIFY
- Add admin routes
- Add role-based route protection
- Update authentication flow

#### D. Redux/State Management

**1. adminActions.js** (NEW)
```
- fetchAllApplications()
- fetchApplicationDetail(id)
- updateApplicationStatus(id, statusData)
- uploadCertificate(appId, file)
- fetchAdminStats()
- deleteApplication(id)
```

**2. adminReducers.js** (NEW)
```
- adminApplicationsList
- selectedApplication
- adminStats
- loading
- error
```

**3. adminConstants.js** (NEW)
```
- ADMIN_FETCH_APPLICATIONS_REQUEST
- ADMIN_FETCH_APPLICATIONS_SUCCESS
- ADMIN_FETCH_APPLICATIONS_FAIL
- ADMIN_UPDATE_STATUS_REQUEST
- ADMIN_UPDATE_STATUS_SUCCESS
- ADMIN_UPDATE_STATUS_FAIL
- ADMIN_UPLOAD_CERTIFICATE_REQUEST
- ADMIN_UPLOAD_CERTIFICATE_SUCCESS
- ADMIN_UPLOAD_CERTIFICATE_FAIL
```

#### E. Styling

**1. AdminDashboard.css** (NEW)
- Dashboard layout styles
- Table styles
- Modal styles for status/reason forms
- Responsive design

---

### 4. SECURITY & AUTHENTICATION

#### A. JWT Token Enhancement
- Ensure JWT token includes user role
- Update token generation to include role: "ADMIN"

#### B. Route Protection
**Frontend**:
- Create PrivateAdminRoute component
- Redirect non-admin users to home
- Check user.role === 'ADMIN'

**Backend**:
- Add @Secured or @PreAuthorize annotations
- Ensure only ADMIN users can access admin endpoints
- Validate role at controller level

#### C. CORS Configuration
- Update CORS settings to allow admin dashboard URLs
- Ensure credentials are passed with requests

---

## Implementation PHASES

### Phase 1: Backend Database & Models (1-2 days)
1. Create database migrations
2. Create new entities (ServiceApplication, etc.)
3. Create repositories
4. Create DTOs

### Phase 2: Backend API Endpoints (2-3 days)
1. Create controllers (AdminController, ServiceApplicationController)
2. Create services (ServiceApplicationService)
3. Implement endpoints with validation
4. Add authentication checks
5. Test endpoints with Postman

### Phase 3: Frontend Admin Dashboard UI (2-3 days)
1. Create admin login page
2. Create dashboard layout
3. Create applications list/table
4. Create detail view page
5. Add basic styling

### Phase 4: Admin Functionalities (2-3 days)
1. Implement status update form
2. Implement rejection reason form
3. Implement certificate upload
4. Connect frontend to backend APIs
5. Add toast notifications

### Phase 5: File Management (1-2 days)
1. Implement file download functionality
2. Implement file preview
3. Add file security checks

### Phase 6: Testing & Bug Fixes (1-2 days)
1. End-to-end testing
2. Security testing
3. Performance optimization
4. Bug fixes

---

## API ENDPOINT SPECIFICATIONS

### Admin Authentication
```
POST /api/auth/admin-login
Body: { email, password }
Response: { token, user: { id, name, email, role } }
```

### Admin Dashboard - Statistics
```
GET /api/admin/dashboard/stats
Headers: { Authorization: "Bearer token" }
Response: {
  totalApplications: 150,
  pendingApplications: 45,
  approvedApplications: 80,
  rejectedApplications: 25,
  inProgressApplications: 10
}
```

### Admin - List Applications
```
GET /api/admin/applications?status=PENDING&page=1&size=10&sort=createdDate
Headers: { Authorization: "Bearer token" }
Response: {
  content: [ApplicationDTO],
  totalElements: 45,
  totalPages: 5,
  currentPage: 1
}
```

### Admin - Get Application Details
```
GET /api/admin/applications/{applicationId}
Response: {
  id, userId, serviceId, status, applicationDate, 
  userDetails: { name, email, mobile },
  serviceDetails: { name, department },
  uploadedFiles: [FileRecord],
  adminNotes, rejectionReason, certificateFile
}
```

### Admin - Update Application Status
```
PUT /api/admin/applications/{applicationId}/status
Body: {
  status: "IN_PROGRESS" | "APPROVED" | "REJECTED",
  adminNotes: "optional notes",
  rejectionReason: "reason if rejected"
}
Response: { updated ApplicationDTO }
```

### Admin - Upload Certificate
```
POST /api/admin/applications/{applicationId}/certificate
Body: FormData { file }
Response: { certificateFileId, fileName, uploadDate }
```

### User - Submit Application
```
POST /api/applications
Body: {
  serviceId: 123,
  formData: { ... user-filled form data },
  documents: [file IDs]
}
Response: { applicationId, status: "PENDING", applicationDate }
```

### User - Get Their Applications
```
GET /api/applications/my
Response: [ApplicationDTO]
```

### Download File
```
GET /api/files/{fileId}/download
Response: Binary file
```

---

## Database Schema Summary

```
users (existing)
├── id (PK)
├── name
├── email (UNIQUE)
├── mobile
├── password
└── role (CITIZEN, ADMIN)

services (existing)
├── id (PK)
├── name
├── description
├── estimatedDays
└── department

service_applications (NEW)
├── id (PK)
├── user_id (FK → users)
├── service_id (FK → services)
├── status (PENDING, IN_PROGRESS, APPROVED, REJECTED)
├── applicationDate
├── updatedDate
├── adminNotes
├── rejectionReason
└── certificateFileId (FK → file_records)

file_records (existing + enhanced)
├── id (PK)
├── originalName
├── storedName
├── filePath
├── contentType
├── fileSize
├── uploadedAt
├── uploadedBy (FK → users)
├── relatedServiceId
└── fileType (USER_UPLOAD, CERTIFICATE)

rejection_reasons (existing + enhanced)
├── id (PK)
├── applicationId (FK → service_applications)
├── reason
└── createdDate
```

---

## Development Checkpoints

### Checkpoint 1: Database Ready
- [ ] Migrations created and executed
- [ ] New tables created
- [ ] Relationships established

### Checkpoint 2: Backend API Ready
- [ ] Models and repositories created
- [ ] Controllers implemented
- [ ] APIs tested with Postman
- [ ] Authentication working

### Checkpoint 3: Frontend UI Ready
- [ ] Admin dashboard pages created
- [ ] Navigation setup
- [ ] Basic styling complete

### Checkpoint 4: Integration Complete
- [ ] Frontend connected to backend
- [ ] All CRUD operations working
- [ ] File uploads/downloads working
- [ ] Status transitions working

### Checkpoint 5: Testing Complete
- [ ] Functionality testing passed
- [ ] Security testing passed
- [ ] Performance acceptable
- [ ] UI/UX validation passed

---

## Testing Scenarios

### Test Case 1: Admin Login
```
1. Navigate to /admin-login
2. Enter admin credentials
3. Click login
4. Verify redirected to admin dashboard
5. Verify role is ADMIN in token
```

### Test Case 2: View All Applications
```
1. Login as admin
2. Navigate to applications
3. Verify all applications display
4. Verify pagination works
5. Verify filtering by status works
```

### Test Case 3: Update Status to In Progress
```
1. Select an application
2. Click "Mark as In Progress"
3. Add admin notes
4. Submit
5. Verify status changed
6. Verify user notification sent
```

### Test Case 4: Reject Application
```
1. Select an application
2. Click "Reject"
3. Enter rejection reason
4. Submit
5. Verify rejection reason saved
6. Verify user notified
```

### Test Case 5: Approve with Certificate
```
1. Select an application
2. Click "Approve"
3. Upload certificate file
4. Submit
5. Verify certificate saved
6. Verify user can download certificate
```

### Test Case 6: Download User Files
```
1. View application details
2. See list of uploaded files
3. Click download on a file
4. Verify file downloads correctly
```

---

## Performance Considerations

1. **Pagination**: Implement pagination for large datasets
2. **Caching**: Cache admin stats (update every 5 minutes)
3. **Lazy Loading**: Load file previews on demand
4. **Indexing**: Index status, userId, serviceId for faster queries
5. **Compression**: Compress file transfers

---

## Security Checklist

- [ ] Only ADMIN role can access admin endpoints
- [ ] Validate file types before upload
- [ ] Implement file size limits
- [ ] Use secure file storage
- [ ] Sanitize user inputs
- [ ] Validate JWT tokens
- [ ] Implement rate limiting on endpoints
- [ ] Log all admin actions
- [ ] Use HTTPS in production
- [ ] Implement CORS properly

---

## File Structure Summary

```
Backend (Spring Boot):
src/main/java/com/govgps/
├── model/
│   ├── ServiceApplication.java (NEW)
│   └── (existing models)
├── repository/
│   ├── ServiceApplicationRepository.java (NEW)
│   └── (existing repos)
├── controller/
│   ├── AdminController.java (NEW)
│   ├── ServiceApplicationController.java (NEW)
│   ├── AdminFileController.java (NEW)
│   └── (existing controllers)
├── service/
│   ├── ServiceApplicationService.java (NEW)
│   ├── AdminFileService.java (NEW)
│   └── (existing services)
└── dto/
    ├── ServiceApplicationDTO.java (NEW)
    ├── ApplicationStatusUpdateRequest.java (NEW)
    ├── AdminDashboardStatsDTO.java (NEW)
    └── (existing DTOs)

Frontend (React):
src/
├── pages/
│   ├── AdminDashboard.jsx (NEW)
│   ├── AdminLogin.jsx (NEW)
│   ├── AdminApplicationDetail.jsx (NEW)
│   ├── AdminFileViewer.jsx (NEW)
│   └── (existing pages)
├── components/
│   ├── ApplicationsList.jsx (NEW)
│   ├── StatusBadge.jsx (NEW)
│   ├── AdminNav.jsx (NEW)
│   └── (existing components)
├── actions/
│   └── adminActions.js (NEW)
├── reducers/
│   └── adminReducers.js (NEW)
├── constants/
│   └── adminConstants.js (NEW)
└── styles/
    └── AdminDashboard.css (NEW)
```

---

## Next Steps

1. Review this plan with team
2. Create database migrations
3. Start with Phase 1: Backend Database
4. Follow through all phases sequentially
5. Test thoroughly at each phase
6. Deploy to production with security checks

