package com.govgps.controller;

import com.govgps.model.UserProgress;
import com.govgps.repository.UserProgressRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final UserProgressRepository userProgressRepository;

    public ProgressController(UserProgressRepository userProgressRepository) {
        this.userProgressRepository = userProgressRepository;
    }

    @PostMapping
    public UserProgress saveProgress(@RequestBody UserProgress progress) {
        return userProgressRepository.save(progress);
    }

    @GetMapping("/{userId}")
    public List<UserProgress> getProgress(@PathVariable("userId") Long userId) {
        return userProgressRepository.findByUserId(userId);
    }
}
