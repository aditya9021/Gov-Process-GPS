package com.govgps.repository;

import com.govgps.model.FileRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FileRecordRepository extends JpaRepository<FileRecord, Long> {
    List<FileRecord> findByRelatedServiceId(Long serviceId);
    List<FileRecord> findByUploadedBy(Long userId);
}
