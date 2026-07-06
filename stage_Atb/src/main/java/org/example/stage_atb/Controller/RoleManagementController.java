// Controller/RoleManagementController.java - CORRIGÉ
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.RoleUpdateRequest;
import org.example.stage_atb.dto.response.RoleResponseDTO;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RoleManagementController {

    private final IUserService userService;

    /**
     * Récupérer tous les utilisateurs avec leurs rôles
     */
    @GetMapping("/users")
    public ResponseEntity<List<RoleResponseDTO>> getAllUsersWithRoles() {
        log.info("Fetching all users with roles");

        List<UserResponseDTO> users = userService.getAllUsers();
        List<RoleResponseDTO> response = users.stream()
                .map(this::convertToRoleResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer les utilisateurs par rôle
     */
    @GetMapping("/by-role/{role}")
    public ResponseEntity<List<RoleResponseDTO>> getUsersByRole(@PathVariable String role) {
        log.info("Fetching users with role: {}", role);

        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            List<UserResponseDTO> users = userService.getUsersByRole(role);
            List<RoleResponseDTO> response = users.stream()
                    .map(this::convertToRoleResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", role);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * ✅ Mettre à jour le rôle d'un utilisateur
     */
    @PutMapping("/update")
    public ResponseEntity<RoleResponseDTO> updateUserRole(@RequestBody RoleUpdateRequest request) {
        log.info("Updating role for user: {}, new role: {}", request.getUserId(), request.getNewRole());

        try {
            // ✅ Vérifier que l'utilisateur existe
            User user = userService.getUserEntityById(request.getUserId());

            // ✅ Vérifier que le nouveau rôle est valide
            if (request.getNewRole() == null) {
                return ResponseEntity.badRequest().build();
            }

            // ✅ Mettre à jour le rôle
            user.setRole(request.getNewRole());

            // ✅ Mettre à jour le statut
            user.setActive(request.isActive());
            user.setLocked(request.isLocked());

            // ✅ Sauvegarder
            User updatedUser = userService.createUser(user);

            // ✅ Convertir en réponse
            UserResponseDTO userResponse = userService.getUserById(updatedUser.getId());
            RoleResponseDTO response = convertToRoleResponse(userResponse);

            log.info("✅ Role updated successfully for user: {} -> {}",
                    updatedUser.getEmail(), updatedUser.getRole());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error updating role: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * ✅ Réinitialiser le rôle d'un utilisateur (mettre à un rôle par défaut)
     */
    @PostMapping("/reset/{userId}")
    public ResponseEntity<RoleResponseDTO> resetUserRole(@PathVariable String userId) {
        log.info("Resetting role for user: {}", userId);

        try {
            User user = userService.getUserEntityById(userId);

            // ✅ Réinitialiser le rôle en fonction du type d'utilisateur
            // Si c'est un employé, mettre ANALYST par défaut
            // Si c'est un client, garder CLIENT
            if (user.getRole() == UserRole.CLIENT) {
                // Ne pas réinitialiser les clients
                return ResponseEntity.badRequest().build();
            } else {
                // Réinitialiser les employés à ANALYST par défaut
                user.setRole(UserRole.ANALYST);
            }

            user.setActive(true);
            user.setLocked(false);

            User updatedUser = userService.createUser(user);
            UserResponseDTO userResponse = userService.getUserById(updatedUser.getId());
            RoleResponseDTO response = convertToRoleResponse(userResponse);

            log.info("✅ Role reset successfully for user: {} -> {}",
                    updatedUser.getEmail(), updatedUser.getRole());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error resetting role: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Récupérer les permissions disponibles
     */
    @GetMapping("/permissions")
    public ResponseEntity<List<String>> getAvailablePermissions() {
        log.info("Fetching available permissions");

        List<String> permissions = List.of(
                // Permissions ADMIN
                "ADMIN_ACCESS", "USER_MANAGEMENT", "ROLE_MANAGEMENT", "SYSTEM_CONFIG",

                // Permissions ANALYST
                "ANALYST_ACCESS", "DOCUMENT_ANALYSIS", "FINANCIAL_ANALYSIS",
                "RISK_ANALYSIS", "DECISION_MAKING", "REPORT_GENERATION",

                // Permissions ADVISOR
                "ADVISOR_ACCESS", "CLIENT_MANAGEMENT", "CREDIT_REQUEST_MANAGEMENT",
                "SIMULATION", "COMMUNICATION",

                // Permissions MANAGER
                "MANAGER_ACCESS", "VALIDATION", "TEAM_MANAGEMENT",
                "DASHBOARD_VIEW", "AI_DECISION_ACCESS",

                // Permissions CLIENT
                "CLIENT_ACCESS", "PROFILE_MANAGEMENT", "CREDIT_APPLICATION",
                "DOCUMENT_UPLOAD", "CONTRACT_VIEW", "SIGNATURE"
        );

        return ResponseEntity.ok(permissions);
    }

    /**
     * Convertir UserResponseDTO en RoleResponseDTO
     */
    private RoleResponseDTO convertToRoleResponse(UserResponseDTO user) {
        List<String> permissions = getPermissionsForRole(user.getRole());

        return RoleResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .permissions(permissions)
                .active(user.isActive())
                .locked(user.isLocked())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    /**
     * Obtenir les permissions par défaut pour un rôle
     */
    private List<String> getPermissionsForRole(UserRole role) {
        if (role == null) return new ArrayList<>();

        switch (role) {
            case ADMIN:
                return List.of("ADMIN_ACCESS", "USER_MANAGEMENT", "ROLE_MANAGEMENT", "SYSTEM_CONFIG");
            case ANALYST:
                return List.of("ANALYST_ACCESS", "DOCUMENT_ANALYSIS", "FINANCIAL_ANALYSIS",
                        "RISK_ANALYSIS", "DECISION_MAKING", "REPORT_GENERATION");
            case ADVISOR:
                return List.of("ADVISOR_ACCESS", "CLIENT_MANAGEMENT", "CREDIT_REQUEST_MANAGEMENT",
                        "SIMULATION", "COMMUNICATION");
            case MANAGER:
                return List.of("MANAGER_ACCESS", "VALIDATION", "TEAM_MANAGEMENT",
                        "DASHBOARD_VIEW", "AI_DECISION_ACCESS");
            case CLIENT:
                return List.of("CLIENT_ACCESS", "PROFILE_MANAGEMENT", "CREDIT_APPLICATION",
                        "DOCUMENT_UPLOAD", "CONTRACT_VIEW", "SIGNATURE");
            default:
                return new ArrayList<>();
        }
    }
}