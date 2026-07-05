package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.EmployeeRepository;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.ProfileResponseDTO;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.Mappers.UserMapper;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;


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

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

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

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("User already exists with email: " + registerRequest.getEmail());
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("User already exists with username: " + registerRequest.getUsername());
        }

        User user = userMapper.toEntity(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        if (user.getRole() == null) {
            user.setRole(UserRole.ANALYST);
        }

        User savedUser = userRepository.save(user);

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

    // ✅ IMPLÉMENTER LA MÉTHODE registerClient
    @Override
    public AuthResponse registerClient(ClientRegisterRequest clientRegisterRequest) {
        log.info("Registering new client: {}", clientRegisterRequest.getEmail());

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(clientRegisterRequest.getEmail())) {
            throw new RuntimeException("User already exists with email: " + clientRegisterRequest.getEmail());
        }

        if (userRepository.existsByUsername(clientRegisterRequest.getUsername())) {
            throw new RuntimeException("User already exists with username: " + clientRegisterRequest.getUsername());
        }

        // Créer l'utilisateur avec le rôle CLIENT
        User user = new User();
        user.setUsername(clientRegisterRequest.getUsername());
        user.setEmail(clientRegisterRequest.getEmail());
        user.setPassword(passwordEncoder.encode(clientRegisterRequest.getPassword()));
        user.setFirstName(clientRegisterRequest.getFirstName());
        user.setLastName(clientRegisterRequest.getLastName());
        user.setPhoneNumber(clientRegisterRequest.getPhoneNumber());
        user.setRole(UserRole.CLIENT); // ✅ Rôle CLIENT
        user.setActive(true);
        user.setLocked(false);

        User savedUser = userRepository.save(user);

        // Générer les tokens
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

    @Override
    public AuthResponse registerEmployee(EmployeeRegisterRequest employeeRegisterRequest) {
        log.info("Registering new employee: {}", employeeRegisterRequest.getEmail());

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(employeeRegisterRequest.getEmail())) {
            throw new RuntimeException("User already exists with email: " + employeeRegisterRequest.getEmail());
        }

        if (userRepository.existsByUsername(employeeRegisterRequest.getUsername())) {
            throw new RuntimeException("User already exists with username: " + employeeRegisterRequest.getUsername());
        }

        // Vérifier que le rôle est valide pour un employé
        UserRole role = employeeRegisterRequest.getRole();
        if (role == UserRole.CLIENT) {
            throw new RuntimeException("Invalid role for employee registration: CLIENT");
        }

        // Créer l'utilisateur avec le rôle correspondant
        User user = new User();
        user.setUsername(employeeRegisterRequest.getUsername());
        user.setEmail(employeeRegisterRequest.getEmail());
        user.setPassword(passwordEncoder.encode(employeeRegisterRequest.getPassword()));
        user.setFirstName(employeeRegisterRequest.getFirstName());
        user.setLastName(employeeRegisterRequest.getLastName());
        user.setPhoneNumber(employeeRegisterRequest.getPhoneNumber());
        user.setRole(role);
        user.setActive(true);
        user.setLocked(false);

        User savedUser = userRepository.save(user);

        // Générer les tokens
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
    public User createUser(User user) {
        log.info("Creating user: {}", user.getEmail());
        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }


    @Override
    public ProfileResponseDTO getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ProfileResponseDTO profile = ProfileResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();

        // Si l'utilisateur est un employé, ajouter les infos employé
        if (user.getRole() != UserRole.CLIENT) {
            employeeRepository.findByUserId(user.getId()).ifPresent(employee -> {
                profile.setEmployeeNumber(employee.getEmployeeNumber());
                profile.setDepartment(employee.getDepartment());
                profile.setPosition(employee.getPosition());
            });
        }

        // Si l'utilisateur est un client, ajouter les infos client
        if (user.getRole() == UserRole.CLIENT) {
            clientRepository.findByEmail(user.getEmail()).ifPresent(client -> {
                profile.setClientNumber(client.getClientNumber());
                profile.setDateOfBirth(client.getDateOfBirth());
                profile.setAddress(client.getAddress());
                profile.setCity(client.getCity());
                profile.setCountry(client.getCountry());
                profile.setPostalCode(client.getPostalCode());
            });
        }

        return profile;
    }

    @Override
    public ProfileResponseDTO updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Mettre à jour les champs de base
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        User updatedUser = userRepository.save(user);

        // Mettre à jour les infos du client si c'est un client
        if (user.getRole() == UserRole.CLIENT) {
            clientRepository.findByEmail(user.getEmail()).ifPresent(client -> {
                if (request.getAddress() != null) client.setAddress(request.getAddress());
                if (request.getCity() != null) client.setCity(request.getCity());
                if (request.getCountry() != null) client.setCountry(request.getCountry());
                if (request.getPostalCode() != null) client.setPostalCode(request.getPostalCode());
                clientRepository.save(client);
            });
        }

        return getProfile(updatedUser.getId());
    }

    @Override
    public void updatePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Vérifier que le mot de passe actuel est correct
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated successfully for user: {}", userId);
    }

}