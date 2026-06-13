package com.govgps.repository;

import com.govgps.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserId(Long userId);
}
