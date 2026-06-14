package com.govgps.controller;

import com.govgps.model.Bookmark;
import com.govgps.repository.BookmarkRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {
    private final BookmarkRepository bookmarkRepository;

    public BookmarkController(BookmarkRepository bookmarkRepository) {
        this.bookmarkRepository = bookmarkRepository;
    }

    @PostMapping
    public Bookmark createBookmark(@RequestBody Bookmark bookmark) {
        return bookmarkRepository.save(bookmark);
    }

    @GetMapping("/{userId}")
    public List<Bookmark> getBookmarks(@PathVariable Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}
