package com.govgps.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long serviceId;
    private Integer stepOrder;
    private String stepName;
    private String department;
    private Integer expectedDays;
    @Column(length = 2000)
    private String description;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }
    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getExpectedDays() { return expectedDays; }
    public void setExpectedDays(Integer expectedDays) { this.expectedDays = expectedDays; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
