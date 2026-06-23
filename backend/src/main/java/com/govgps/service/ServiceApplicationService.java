package com.govgps.service;

import com.govgps.dto.AdminDashboardStatsDTO;
import com.govgps.dto.ServiceApplicationDTO;
import com.govgps.model.GovService;
import com.govgps.model.ServiceApplication;
import com.govgps.model.User;
import com.govgps.repository.GovServiceRepository;
import com.govgps.repository.ServiceApplicationRepository;
import com.govgps.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceApplicationService {
    private final ServiceApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final GovServiceRepository serviceRepository;

    public ServiceApplicationService(ServiceApplicationRepository applicationRepository,
                                     UserRepository userRepository,
                                     GovServiceRepository serviceRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    // Create a new service application
    public ServiceApplication createApplication(Long userId, Long serviceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        GovService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));

        ServiceApplication application = new ServiceApplication(user, service);
        return applicationRepository.save(application);
    }

    // Get application by ID
    public Optional<ServiceApplication> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    // Get all applications for a user
    public Page<ServiceApplication> getUserApplications(Long userId, Pageable pageable) {
        return applicationRepository.findByUserIdOrderByApplicationDateDesc(userId, pageable);
    }

    // Get paginated applications for admin
    public Page<ServiceApplication> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    // Get paginated applications filtered by status
    public Page<ServiceApplication> getApplicationsByStatus(String status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable);
    }

    // Update application status
    public ServiceApplication updateApplicationStatus(Long applicationId, String status, String adminNotes, String rejectionReason, Long certificateFileId) {
        ServiceApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        if ("APPROVED".equals(status) && certificateFileId == null) {
            throw new RuntimeException("Certificate file is required when approving an application");
        }

        application.setStatus(status);
        application.setUpdatedDate(LocalDateTime.now());

        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            application.setAdminNotes(adminNotes);
        }

        if ("REJECTED".equals(status) && rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            application.setRejectionReason(rejectionReason);
        }

        if (certificateFileId != null) {
            application.setCertificateFileId(certificateFileId);
        }

        return applicationRepository.save(application);
    }

    // Upload certificate
    public ServiceApplication uploadCertificate(Long applicationId, Long certificateFileId) {
        ServiceApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        application.setCertificateFileId(certificateFileId);
        application.setUpdatedDate(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    // Get dashboard statistics
    public AdminDashboardStatsDTO getDashboardStats() {
        long total = applicationRepository.count();
        long pending = applicationRepository.countByStatus("PENDING");
        long inProgress = applicationRepository.countByStatus("IN_PROGRESS");
        long approved = applicationRepository.countByStatus("APPROVED");
        long rejected = applicationRepository.countByStatus("REJECTED");

        return new AdminDashboardStatsDTO(total, pending, approved, rejected, inProgress);
    }

    // Convert to DTO
    public ServiceApplicationDTO convertToDTO(ServiceApplication application) {
        return new ServiceApplicationDTO(
                application.getId(),
                application.getUser().getId(),
                application.getUser().getName(),
                application.getUser().getEmail(),
                application.getUser().getMobile(),
                application.getService().getId(),
                application.getService().getName(),
                application.getService().getDepartment(),
                application.getStatus(),
                application.getApplicationDate(),
                application.getUpdatedDate(),
                application.getAdminNotes(),
                application.getRejectionReason(),
                application.getCertificateFileId()
        );
    }

    // Convert list to DTOs
    public List<ServiceApplicationDTO> convertToDTOs(List<ServiceApplication> applications) {
        return applications.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Delete application
    public void deleteApplication(Long applicationId) {
        applicationRepository.deleteById(applicationId);
    }
}
