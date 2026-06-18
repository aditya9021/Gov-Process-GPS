package com.govgps.repository;

import com.govgps.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByEmail(String email);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.email = 'admin@govgps.local'")
    void deleteAdminUser();
}
