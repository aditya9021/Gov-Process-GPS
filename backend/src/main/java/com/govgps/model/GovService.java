package com.govgps.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "services")
public class GovService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(length = 2000)
    private String description;
    private Integer estimatedDays;
    private String department;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
