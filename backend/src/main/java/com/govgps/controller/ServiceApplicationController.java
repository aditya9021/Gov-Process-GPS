package com.govgps.controller;

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
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ServiceApplicationController {
    private final ServiceApplicationService applicationService;

    public ServiceApplicationController(ServiceApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * User submits an application for a service
     * POST /api/applications
     */
    @PostMapping
    public ResponseEntity<?> submitApplication(
            @RequestParam Long userId,
            @RequestParam Long serviceId) {
        try {
            if (userId == null || serviceId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "userId and serviceId are required"));
            }

            ServiceApplication application = applicationService.createApplication(userId, serviceId);
            ServiceApplicationDTO dto = applicationService.convertToDTO(application);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Application submitted successfully",
                    "application", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit application: " + e.getMessage()));
        }
    }

    /**
     * Get user's applications
     * GET /api/applications/my?page=0&size=10
     */
    @GetMapping("/my")
    public ResponseEntity<?> getUserApplications(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "userId is required"));
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "applicationDate"));
            Page<ServiceApplication> applicationPage = applicationService.getUserApplications(userId, pageable);
            List<ServiceApplicationDTO> dtos = applicationService.convertToDTOs(applicationPage.getContent());

            return ResponseEntity.ok(Map.of(
                    "applications", dtos,
                    "total", applicationPage.getTotalElements(),
                    "page", applicationPage.getNumber(),
                    "size", applicationPage.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch applications: " + e.getMessage()));
        }
    }

    /**
     * Get specific application details
     * GET /api/applications/{id}
     */
    @GetMapping("/{id}")
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
     * Cancel application
     * DELETE /api/applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelApplication(@PathVariable Long id) {
        try {
            ServiceApplication application = applicationService.getApplicationById(id)
                    .orElse(null);

            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Application not found"));
            }

            // Only PENDING applications can be cancelled
            if (!"PENDING".equals(application.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only pending applications can be cancelled"));
            }

            applicationService.deleteApplication(id);
            return ResponseEntity.ok(Map.of("message", "Application cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel application: " + e.getMessage()));
        }
    }
}
