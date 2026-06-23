package com.govgps.repository;

import com.govgps.model.ServiceApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceApplicationRepository extends JpaRepository<ServiceApplication, Long> {
    List<ServiceApplication> findByUserId(Long userId);

    List<ServiceApplication> findByServiceId(Long serviceId);

    List<ServiceApplication> findByStatus(String status);

    Page<ServiceApplication> findAll(Pageable pageable);

    Page<ServiceApplication> findByStatus(String status, Pageable pageable);

    Page<ServiceApplication> findByUserIdOrderByApplicationDateDesc(Long userId, Pageable pageable);

    long countByStatus(String status);

    long count();
}
