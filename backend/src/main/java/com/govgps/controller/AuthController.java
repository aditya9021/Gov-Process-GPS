package com.govgps.controller;

import com.govgps.model.User;
import com.govgps.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        user.setRole("CITIZEN");
        // password should be encoded in real app
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        Optional<User> found = userRepository.findByEmail(credentials.getEmail());
        if (found.isEmpty()) return ResponseEntity.status(401).body("Invalid credentials");
        User u = found.get();
        if (!u.getPassword().equals(credentials.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        // return a dummy token for now
        return ResponseEntity.ok(java.util.Map.of("token", "dummy-jwt-token", "user", u));
    }
}
