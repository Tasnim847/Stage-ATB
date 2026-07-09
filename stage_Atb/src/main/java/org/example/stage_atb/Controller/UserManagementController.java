// Controller/UserManagementController.java - VERSION COMPLÈTE CORRIGÉE

package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IEmployeeService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.ClientRegisterRequest;
import org.example.stage_atb.dto.request.EmployeeRegisterRequest;
import org.example.stage_atb.dto.request.UserCreateRequest;
import org.example.stage_atb.dto.request.UserUpdateRequest;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.Employee;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final IUserService userService;
    private final IClientService clientService;
    private final IEmployeeService employeeService;
    private final PasswordEncoder passwordEncoder;

    // ============================================
    // CRÉATION DES ENTITÉS ASSOCIÉES
    // ============================================

    /**
     * Créer un employé à partir d'un utilisateur
     */
    private void createEmployeeFromUser(User user, UserCreateRequest request) {
        // ✅ Générer le numéro d'employé
        String employeeNumber = generateEmployeeNumber();
        log.info("📝 Création d'un employé avec le numéro: {}", employeeNumber);

        // ✅ Créer le DTO avec le numéro d'employé
        EmployeeRegisterRequest employeeRequest = convertToEmployeeRegisterRequest(request, employeeNumber);

        // ✅ Appeler le service
        employeeService.createEmployeeFromUser(user, employeeRequest);
        log.info("✅ Employé créé pour l'utilisateur: {}", user.getEmail());
    }

    /**
     * Créer un client à partir d'un utilisateur
     */
    private void createClientFromUser(User user, UserCreateRequest request) {
        // ✅ Générer le numéro de client
        String clientNumber = generateClientNumber();
        log.info("📝 Création d'un client avec le numéro: {}", clientNumber);

        // ✅ Créer le DTO
        ClientRegisterRequest clientRequest = convertToClientRegisterRequest(request);

        // ✅ Appeler le service
        clientService.createClientFromUser(user, clientRequest);
        log.info("✅ Client créé pour l'utilisateur: {}", user.getEmail());
    }

    // ============================================
    // ENDPOINTS
    // ============================================

    /**
     * Récupérer tous les utilisateurs
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        log.info("📋 Récupération de tous les utilisateurs");
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Récupérer un utilisateur par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        log.info("👤 Récupération de l'utilisateur: {}", id);
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Créer un nouvel utilisateur avec gestion des rôles
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateRequest request) {
        log.info("➕ Création d'un nouvel utilisateur: {} avec rôle: {}", request.getEmail(), request.getRole());
        try {
            // Vérifier si l'email existe déjà
            if (userService.existsByEmail(request.getEmail())) {
                log.warn("⚠️ Email déjà existant: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email déjà existant: " + request.getEmail());
            }

            // Vérifier si le username existe déjà
            if (userService.existsByUsername(request.getUsername())) {
                log.warn("⚠️ Username déjà existant: {}", request.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Nom d'utilisateur déjà existant: " + request.getUsername());
            }

            // 1. Créer l'utilisateur
            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setEmail(request.getEmail());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setFirstName(request.getFirstName());
            newUser.setLastName(request.getLastName());
            newUser.setPhoneNumber(request.getPhoneNumber());
            newUser.setRole(request.getRole());
            newUser.setActive(true);
            newUser.setLocked(false);

            User savedUser = userService.createUser(newUser);
            log.info("✅ Utilisateur créé avec ID: {}", savedUser.getId());

            // 2. Créer l'entité associée selon le rôle
            if (request.getRole() == UserRole.CLIENT) {
                createClientFromUser(savedUser, request);
            } else {
                createEmployeeFromUser(savedUser, request);
            }

            UserResponseDTO response = userService.getUserById(savedUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de l'utilisateur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création: " + e.getMessage());
        }
    }

    /**
     * Modifier un utilisateur
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("✏️ Modification de l'utilisateur: {}", id);
        try {
            User user = userService.getUserEntityById(id);

            if (request.getUsername() != null) user.setUsername(request.getUsername());
            if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
            if (request.getLastName() != null) user.setLastName(request.getLastName());
            if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            if (request.getRole() != null) user.setRole(request.getRole());
            if (request.getActive() != null) user.setActive(request.getActive());
            if (request.getLocked() != null) user.setLocked(request.getLocked());

            User updatedUser = userService.createUser(user);
            UserResponseDTO response = userService.getUserById(updatedUser.getId());

            log.info("✅ Utilisateur modifié avec succès: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la modification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification: " + e.getMessage());
        }
    }

    /**
     * Désactiver un utilisateur
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable String id) {
        log.info("🔒 Désactivation de l'utilisateur: {}", id);
        try {
            User user = userService.getUserEntityById(id);
            user.setActive(false);
            userService.createUser(user);
            log.info("✅ Utilisateur désactivé: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la désactivation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Activer un utilisateur
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String id) {
        log.info("🔓 Activation de l'utilisateur: {}", id);
        try {
            User user = userService.getUserEntityById(id);
            user.setActive(true);
            userService.createUser(user);
            log.info("✅ Utilisateur activé: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'activation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Réinitialiser le mot de passe
     */
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable String id) {
        log.info("🔑 Réinitialisation du mot de passe pour: {}", id);
        try {
            User user = userService.getUserEntityById(id);
            user.setPassword(passwordEncoder.encode("ATB2024!"));
            userService.createUser(user);
            log.info("✅ Mot de passe réinitialisé pour: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la réinitialisation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verrouiller un utilisateur
     */
    @PatchMapping("/{id}/lock")
    public ResponseEntity<Void> lockUser(@PathVariable String id) {
        log.info("🔒 Verrouillage de l'utilisateur: {}", id);
        try {
            User user = userService.getUserEntityById(id);
            user.setLocked(true);
            userService.createUser(user);
            log.info("✅ Utilisateur verrouillé: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors du verrouillage: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Déverrouiller un utilisateur
     */
    @PatchMapping("/{id}/unlock")
    public ResponseEntity<Void> unlockUser(@PathVariable String id) {
        log.info("🔓 Déverrouillage de l'utilisateur: {}", id);
        try {
            User user = userService.getUserEntityById(id);
            user.setLocked(false);
            userService.createUser(user);
            log.info("✅ Utilisateur déverrouillé: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors du déverrouillage: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================
    // MÉTHODES UTILITAIRES
    // ============================================

    private String generateEmployeeNumber() {
        return "EMP-" + System.currentTimeMillis() + "-" + String.format("%04d", (int)(Math.random() * 10000));
    }

    private String generateClientNumber() {
        return "CLT-" + System.currentTimeMillis() + "-" + String.format("%04d", (int)(Math.random() * 10000));
    }

    /**
     * ✅ Convertir UserCreateRequest en ClientRegisterRequest
     */
    private ClientRegisterRequest convertToClientRegisterRequest(UserCreateRequest request) {
        return ClientRegisterRequest.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .build();
    }

    /**
     * ✅ Convertir UserCreateRequest en EmployeeRegisterRequest avec numéro d'employé
     */
    private EmployeeRegisterRequest convertToEmployeeRegisterRequest(UserCreateRequest request, String employeeNumber) {
        log.info("📝 Conversion en EmployeeRegisterRequest avec numéro: {}", employeeNumber);

        return EmployeeRegisterRequest.builder()
                .employeeNumber(employeeNumber) // ✅ NUMÉRO D'EMPLOYÉ GÉNÉRÉ
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .department(request.getDepartment() != null ? request.getDepartment() : "Non défini")
                .position(request.getPosition() != null ? request.getPosition() : "Non défini")
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .build();
    }
}