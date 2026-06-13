package com.govgps.repository;

import com.govgps.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByServiceId(Long serviceId);
}
