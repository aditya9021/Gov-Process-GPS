package com.govgps.dto;

public class ApplicationStatusUpdateRequest {
    private String status; // IN_PROGRESS, APPROVED, REJECTED
    private String adminNotes;
    private String rejectionReason;
    private Long certificateFileId;

    // Constructors
    public ApplicationStatusUpdateRequest() {
    }

    public ApplicationStatusUpdateRequest(String status, String adminNotes, String rejectionReason, Long certificateFileId) {
        this.status = status;
        this.adminNotes = adminNotes;
        this.rejectionReason = rejectionReason;
        this.certificateFileId = certificateFileId;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
