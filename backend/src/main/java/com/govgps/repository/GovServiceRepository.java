package com.govgps.repository;

import com.govgps.model.GovService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface GovServiceRepository extends JpaRepository<GovService, Long> {
    Optional<GovService> findByName(String name);
    List<GovService> findAllByName(String name);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM GovService g WHERE g.name IN ('Income Certificate', 'Shop License', 'PAN Card', 'Birth Certificate')")
    void deleteDefaultServices();
}

