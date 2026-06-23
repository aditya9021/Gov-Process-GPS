package com.govgps.controller;

import com.govgps.dto.RegisterRequest;
import com.govgps.model.User;
import com.govgps.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setMobile(request.getMobile().trim());
        user.setRole("CITIZEN");
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        Optional<User> found = userRepository.findByEmail(credentials.getEmail());
        if (found.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        User u = found.get();
        // Debug: log password match diagnostic (do not log raw password or hash in production)
        String stored = u.getPassword();
        int storedLen = stored == null ? 0 : stored.length();
        boolean matched = false;
        try {
            matched = passwordEncoder.matches(credentials.getPassword(), stored);
        } catch (Exception ex) {
            logger.error("Error while matching password for {}: {}", credentials.getEmail(), ex.getMessage());
        }
        logger.info("Login attempt for {}: storedPassLen={}, matched={}", credentials.getEmail(), storedLen, matched);
        if (!matched) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        u.setPassword(null);
        return ResponseEntity.ok(Map.of("token", "dummy-jwt-token", "user", u));
    }
}
