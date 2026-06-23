package com.govgps.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_applications")
public class ServiceApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private GovService service;

    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, APPROVED, REJECTED

    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(length = 2000)
    private String adminNotes;

    @Column(length = 2000)
    private String rejectionReason;

    @Column(name = "certificate_file_id")
    private Long certificateFileId;

    // Constructors
    public ServiceApplication() {
        this.status = "PENDING";
        this.applicationDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    public ServiceApplication(User user, GovService service) {
        this();
        this.user = user;
        this.service = service;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public GovService getService() {
        return service;
    }

    public void setService(GovService service) {
        this.service = service;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getCertificateFileId() {
        return certificateFileId;
    }

    public void setCertificateFileId(Long certificateFileId) {
        this.certificateFileId = certificateFileId;
    }
}
