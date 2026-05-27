package com.cvproje.resume.service;

import com.cvproje.resume.dto.AuthDtos;
import com.cvproje.resume.entity.User;
import com.cvproje.resume.exception.ApiException;
import com.cvproje.resume.repository.UserRepository;
import com.cvproje.resume.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
        }
        User u = new User();
        u.setEmail(req.email());
        u.setFullName(req.fullName());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRole("USER");
        userRepository.save(u);
        String token = jwtService.generateToken(u.getId(), u.getEmail(), u.getRole());
        return new AuthDtos.AuthResponse(token, u.getEmail(), u.getFullName(), u.getRole());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtService.generateToken(u.getId(), u.getEmail(), u.getRole());
        return new AuthDtos.AuthResponse(token, u.getEmail(), u.getFullName(), u.getRole());
    }
}
