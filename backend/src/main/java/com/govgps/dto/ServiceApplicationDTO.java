package com.govgps.dto;

import java.time.LocalDateTime;

public class ServiceApplicationDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userMobile;
    private Long serviceId;
    private String serviceName;
    private String department;
    private String status;
    private LocalDateTime applicationDate;
    private LocalDateTime updatedDate;
    private String adminNotes;
    private String rejectionReason;
    private Long certificateFileId;

    // Constructors
    public ServiceApplicationDTO() {
    }

    public ServiceApplicationDTO(Long id, Long userId, String userName, String userEmail, String userMobile,
                                 Long serviceId, String serviceName, String department, String status,
                                 LocalDateTime applicationDate, LocalDateTime updatedDate, String adminNotes,
                                 String rejectionReason, Long certificateFileId) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userMobile = userMobile;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.department = department;
        this.status = status;
        this.applicationDate = applicationDate;
        this.updatedDate = updatedDate;
        this.adminNotes = adminNotes;
        this.rejectionReason = rejectionReason;
        this.certificateFileId = certificateFileId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserMobile() {
        return userMobile;
    }

    public void setUserMobile(String userMobile) {
        this.userMobile = userMobile;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
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
