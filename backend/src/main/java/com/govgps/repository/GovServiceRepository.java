package com.govgps.repository;

import com.govgps.model.GovService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GovServiceRepository extends JpaRepository<GovService, Long> {
}
