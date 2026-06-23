package com.govgps.dto;

public class AdminDashboardStatsDTO {
    private long totalApplications;
    private long pendingApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private long inProgressApplications;

    // Constructors
    public AdminDashboardStatsDTO() {
    }

    public AdminDashboardStatsDTO(long totalApplications, long pendingApplications, long approvedApplications,
                                   long rejectedApplications, long inProgressApplications) {
        this.totalApplications = totalApplications;
        this.pendingApplications = pendingApplications;
        this.approvedApplications = approvedApplications;
        this.rejectedApplications = rejectedApplications;
        this.inProgressApplications = inProgressApplications;
    }

    // Getters and Setters
    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(long pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public long getApprovedApplications() {
        return approvedApplications;
    }

    public void setApprovedApplications(long approvedApplications) {
        this.approvedApplications = approvedApplications;
    }

    public long getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(long rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }

    public long getInProgressApplications() {
        return inProgressApplications;
    }

    public void setInProgressApplications(long inProgressApplications) {
        this.inProgressApplications = inProgressApplications;
    }
}
