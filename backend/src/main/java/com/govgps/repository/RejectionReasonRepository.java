package com.govgps.repository;

import com.govgps.model.RejectionReason;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RejectionReasonRepository extends JpaRepository<RejectionReason, Long> {
    List<RejectionReason> findByServiceId(Long serviceId);
}
