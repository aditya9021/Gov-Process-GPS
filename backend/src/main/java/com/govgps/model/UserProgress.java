package com.govgps.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long serviceId;
    private Integer completedStep;
    private String status;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public Integer getCompletedStep() { return completedStep; }
    public void setCompletedStep(Integer completedStep) { this.completedStep = completedStep; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
