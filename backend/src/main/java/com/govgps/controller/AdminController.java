package com.govgps.controller;

import com.govgps.dto.AdminDashboardStatsDTO;
import com.govgps.dto.ApplicationStatusUpdateRequest;
import com.govgps.dto.ServiceApplicationDTO;
import com.govgps.model.ServiceApplication;
import com.govgps.service.ServiceApplicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {
    private final ServiceApplicationService applicationService;

    public AdminController(ServiceApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            AdminDashboardStatsDTO stats = applicationService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }

    /**
     * Get all applications with pagination and filtering
     * GET /api/admin/applications?page=0&size=10&status=PENDING&sort=applicationDate,desc
     */
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "applicationDate,desc") String sort) {
        try {
            String[] sortParams = sort.split(",");
            Sort.Direction direction = "desc".equalsIgnoreCase(sortParams.length > 1 ? sortParams[1] : "asc")
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            String sortField = sortParams[0];

            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

            Page<ServiceApplication> applicationPage;
            if (status != null && !status.isEmpty()) {
                applicationPage = applicationService.getApplicationsByStatus(status, pageable);
            } else {
                applicationPage = applicationService.getAllApplications(pageable);
            }

            List<ServiceApplicationDTO> dtos = applicationService.convertToDTOs(applicationPage.getContent());

            Map<String, Object> response = new HashMap<>();
            response.put("content", dtos);
            response.put("totalElements", applicationPage.getTotalElements());
            response.put("totalPages", applicationPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch applications: " + e.getMessage()));
        }
    }

    /**
     * Get application details by ID
     * GET /api/admin/applications/{id}
     */
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationDetail(@PathVariable Long id) {
        try {
            ServiceApplication application = applicationService.getApplicationById(id)
                    .orElse(null);

            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Application not found"));
            }

            ServiceApplicationDTO dto = applicationService.convertToDTO(application);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch application: " + e.getMessage()));
        }
    }

    /**
     * Update application status
     * PUT /api/admin/applications/{id}/status
     */
    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody ApplicationStatusUpdateRequest request) {
        try {
            // Validate status
            String status = request.getStatus();
            if (!isValidStatus(status)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid status. Must be one of: PENDING, IN_PROGRESS, APPROVED, REJECTED"));
            }

            // Validate rejection reason if rejecting
            if ("REJECTED".equals(status) && (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Rejection reason is required when status is REJECTED"));
            }

            ServiceApplication updated = applicationService.updateApplicationStatus(
                    id,
                    status,
                    request.getAdminNotes(),
                    request.getRejectionReason(),
                    request.getCertificateFileId()
            );

            ServiceApplicationDTO dto = applicationService.convertToDTO(updated);
            return ResponseEntity.ok(Map.of(
                    "message", "Application status updated successfully",
                    "application", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update application: " + e.getMessage()));
        }
    }

    /**
     * Upload certificate for approved application
     * POST /api/admin/applications/{id}/certificate
     */
    @PostMapping("/applications/{id}/certificate")
    public ResponseEntity<?> uploadCertificate(
            @PathVariable Long id,
            @RequestParam Long certificateFileId) {
        try {
            ServiceApplication application = applicationService.getApplicationById(id)
                    .orElse(null);

            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Application not found"));
            }

            if (!"APPROVED".equals(application.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Certificate can only be uploaded for approved applications"));
            }

            ServiceApplication updated = applicationService.uploadCertificate(id, certificateFileId);
            ServiceApplicationDTO dto = applicationService.convertToDTO(updated);

            return ResponseEntity.ok(Map.of(
                    "message", "Certificate uploaded successfully",
                    "application", dto
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload certificate: " + e.getMessage()));
        }
    }

    /**
     * Delete application
     * DELETE /api/admin/applications/{id}
     */
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        try {
            ServiceApplication application = applicationService.getApplicationById(id)
                    .orElse(null);

            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Application not found"));
            }

            applicationService.deleteApplication(id);
            return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete application: " + e.getMessage()));
        }
    }

    /**
     * Validate status value
     */
    private boolean isValidStatus(String status) {
        return status != null && (
                status.equals("PENDING") ||
                        status.equals("IN_PROGRESS") ||
                        status.equals("APPROVED") ||
                        status.equals("REJECTED")
        );
    }
}
