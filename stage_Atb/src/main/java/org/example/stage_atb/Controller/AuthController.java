package org.example.stage_atb.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.LoginRequest;
import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.ErrorResponse;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "API pour l'authentification et l'inscription des utilisateurs")
@Slf4j
public class AuthController {

    private final IUserService userService;

    // Controller/AuthController.java - MODIFIER LA MÉTHODE LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Tentative de connexion pour l'email: {}", loginRequest.getEmail());
        try {
            // ✅ Vérifier d'abord si l'utilisateur existe
            User user = userService.getUserByEmailEntity(loginRequest.getEmail());

            // ✅ Vérifier si le compte est actif
            if (!user.isActive()) {
                log.warn("Tentative de connexion sur un compte inactif: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("ACCOUNT_INACTIVE",
                                "Votre compte a été désactivé. Veuillez contacter l'administrateur."));
            }

            // ✅ Vérifier si le compte est verrouillé
            if (user.isLocked()) {
                log.warn("Tentative de connexion sur un compte verrouillé: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("ACCOUNT_LOCKED",
                                "Votre compte est verrouillé. Veuillez contacter l'administrateur."));
            }

            // ✅ Vérifier si c'est un client et si son compte client est actif
            if (user.getRole() == UserRole.CLIENT) {
                // Récupérer le client associé
                var client = userService.getClientByUserId(user.getId());
                if (client != null && !client.isActive()) {
                    log.warn("Tentative de connexion sur un compte client désactivé: {}", loginRequest.getEmail());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ErrorResponse("CLIENT_INACTIVE",
                                    "Votre compte client a été désactivé. Veuillez contacter l'administrateur."));
                }
            }

            AuthResponse response = userService.login(loginRequest);
            log.info("Connexion réussie pour: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException | UsernameNotFoundException e) {
            log.warn("Échec de connexion - Email ou mot de passe incorrect: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("UNAUTHORIZED", "Email ou mot de passe incorrect"));
        } catch (Exception e) {
            log.error("Erreur lors de la connexion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("SERVER_ERROR", "Une erreur est survenue lors de la connexion"));
        }
    }

    @PostMapping("/register")
    @Operation(
            summary = "Inscription utilisateur",
            description = "Crée un nouveau compte utilisateur. " +
                    "Les rôles disponibles sont: ADMIN, ANALYST, ADVISOR, MANAGER"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Inscription réussie - Compte créé et token JWT généré",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Requête invalide - Données manquantes ou invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflit - Email ou nom d'utilisateur déjà existant",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur serveur",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Tentative d'inscription pour l'email: {}", registerRequest.getEmail());
        try {
            AuthResponse response = userService.register(registerRequest);
            log.info("Inscription réussie pour: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Échec d'inscription - Données invalides: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("INVALID_DATA", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("already exists")) {
                log.warn("Échec d'inscription - Utilisateur déjà existant: {}", registerRequest.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("USER_EXISTS", e.getMessage()));
            }
            log.error("Erreur lors de l'inscription: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("SERVER_ERROR", "Une erreur est survenue lors de l'inscription"));
        }
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Déconnexion",
            description = "Déconnecte l'utilisateur. Le token JWT doit être supprimé côté client."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Déconnexion réussie",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<Void> logout() {
        log.info("Déconnexion de l'utilisateur");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Rafraîchir le token JWT",
            description = "Génère un nouveau token JWT à partir d'un refresh token valide."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token rafraîchi avec succès",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Refresh token manquant",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token invalide ou expiré",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String refreshToken) {
        log.info("Tentative de rafraîchissement du token");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("MISSING_TOKEN", "Refresh token est requis"));
        }

        try {
            String token = refreshToken.startsWith("Bearer ") ? refreshToken.substring(7) : refreshToken;
            // Implémenter la logique de rafraîchissement
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erreur lors du rafraîchissement du token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("INVALID_TOKEN", "Refresh token invalide ou expiré"));
        }
    }

    @GetMapping("/me")
    @Operation(
            summary = "Récupérer l'utilisateur connecté",
            description = "Retourne les informations de l'utilisateur actuellement authentifié"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Utilisateur trouvé",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<?> getCurrentUser() {
        try {
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'utilisateur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("UNAUTHORIZED", "Utilisateur non authentifié"));
        }
    }

    @GetMapping("/validate")
    @Operation(
            summary = "Valider le token JWT",
            description = "Vérifie si le token JWT est valide et non expiré"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token valide",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Token invalide",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok().build();
    }

    // Controller/AuthController.java - AJOUTER
    @GetMapping("/check-status/{email}")
    @Operation(
            summary = "Vérifier le statut du compte",
            description = "Vérifie si un compte existe et s'il est actif"
    )
    public ResponseEntity<?> checkAccountStatus(@PathVariable String email) {
        try {
            User user = userService.getUserByEmailEntity(email);

            Map<String, Object> status = new HashMap<>();
            status.put("exists", true);
            status.put("active", user.isActive());
            status.put("locked", user.isLocked());
            status.put("role", user.getRole());

            return ResponseEntity.ok(status);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("USER_NOT_FOUND", "Utilisateur non trouvé"));
        }
    }
}