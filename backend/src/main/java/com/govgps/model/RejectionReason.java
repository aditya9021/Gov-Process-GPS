package com.govgps.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rejection_reasons")
public class RejectionReason {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long serviceId;
    @Column(length = 1000)
    private String reason;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
