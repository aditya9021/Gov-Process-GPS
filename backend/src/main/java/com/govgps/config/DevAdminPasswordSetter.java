package com.govgps.config;

import com.govgps.model.User;
import com.govgps.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DevAdminPasswordSetter implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Logger logger = LoggerFactory.getLogger(DevAdminPasswordSetter.class);

    public DevAdminPasswordSetter(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        Optional<User> admin = userRepository.findByEmail("admin@test.com");
        if (admin.isPresent()) {
            User u = admin.get();
            String newHash = passwordEncoder.encode("admin");
            u.setPassword(newHash);
            userRepository.save(u);
            logger.info("DevAdminPasswordSetter: updated admin@test.com password hash (len={})", newHash.length());
        } else {
            logger.info("DevAdminPasswordSetter: admin@test.com not found");
        }
    }
}
