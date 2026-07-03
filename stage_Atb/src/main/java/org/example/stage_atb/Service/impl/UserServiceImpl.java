package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.LoginRequest;
import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.Mappers.UserMapper;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Utiliser directement User (plus simple)
        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .expirationDate(LocalDateTime.now().plusHours(24))
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user: {}", registerRequest.getEmail());

        // Check if user exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("User already exists with email: " + registerRequest.getEmail());
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("User already exists with username: " + registerRequest.getUsername());
        }

        // Create user
        User user = userMapper.toEntity(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole(UserRole.ANALYST);
        }

        User savedUser = userRepository.save(user);

        // Utiliser directement User (plus simple)
        String jwtToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole())
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .expirationDate(LocalDateTime.now().plusHours(24))
                .build();
    }

    @Override
    public UserResponseDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getUsersByRole(String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole)
                    .stream()
                    .map(userMapper::toResponseDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    @Override
    public UserResponseDTO updateUser(String id, RegisterRequest registerRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        userMapper.updateEntity(user, registerRequest);

        if (registerRequest.getPassword() != null && !registerRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted with id: {}", id);
    }

    @Override
    public void activateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(true);
        userRepository.save(user);
        log.info("User activated: {}", id);
    }

    @Override
    public void deactivateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
        log.info("User deactivated: {}", id);
    }

    @Override
    public void lockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setLocked(true);
        userRepository.save(user);
        log.info("User locked: {}", id);
    }

    @Override
    public void unlockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setLocked(false);
        userRepository.save(user);
        log.info("User unlocked: {}", id);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public long countActiveUsers() {
        return userRepository.countActiveUsers();
    }

    @Override
    public User getUserEntityById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
}