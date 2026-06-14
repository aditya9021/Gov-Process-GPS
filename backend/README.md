# Government Process GPS - Backend

This is a minimal Spring Boot backend scaffold for the Government Process GPS project.

It uses H2 in-memory database for quick local development and seeds sample data on startup.

Requirements:
- Java 21
- Maven

Run (PowerShell):

```powershell
cd backend
mvn clean spring-boot:run
```

API endpoints seeded:
- GET /api/services
- GET /api/services/{id}
- GET /api/workflow/{serviceId}
- GET /api/documents/{serviceId}
- GET /api/rejections/{serviceId}
- POST /api/auth/register
- POST /api/auth/login
 - POST /api/auth/login

CI
--
This project includes a GitHub Actions workflow at `.github/workflows/backend-ci.yml` that builds the backend and runs tests. To enable CI, push the `backend/` folder to a GitHub repository and the workflow will run on push.
Try sample requests (PowerShell):

```powershell
# List services
Invoke-RestMethod -Method GET -Uri http://localhost:8080/api/services

# Search services
Invoke-RestMethod -Method GET -Uri "http://localhost:8080/api/services?query=shop"

# Get workflow for service id 1
Invoke-RestMethod -Method GET -Uri http://localhost:8080/api/workflow/1

# Create a bookmark (example)
# Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/bookmarks -Body (@{userId=1;serviceId=1} | ConvertTo-Json) -ContentType 'application/json'
```

H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:govgpsdb)

Notes:
- Passwords are stored in plain text in this scaffold for simplicity; use password encoding (BCrypt) and JWT for production.
- To switch to MySQL, update `application.properties` and set spring.jpa.hibernate.ddl-auto appropriately.
