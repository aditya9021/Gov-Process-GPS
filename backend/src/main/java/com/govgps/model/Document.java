package com.govgps.model;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long serviceId;
    private String documentName;
    private Boolean mandatory;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public Boolean getMandatory() { return mandatory; }
    public void setMandatory(Boolean mandatory) { this.mandatory = mandatory; }
}
