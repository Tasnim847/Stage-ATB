package org.example.stage_atb.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.LoginRequest;
import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentification", description = "API pour l'authentification et l'inscription des utilisateurs")
public class AuthController {

    private final IUserService userService;

    @PostMapping("/login")
    @Operation(
            summary = "Authentification utilisateur",
            description = "Connecte un utilisateur et retourne un token JWT. " +
                    "Utilisez ce token dans l'en-tête Authorization pour accéder aux endpoints sécurisés."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Authentification réussie - Token JWT généré",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Requête invalide - Email ou mot de passe manquant",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentification échouée - Email ou mot de passe incorrect",
                    content = @Content
            )
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = userService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(
            summary = "Inscription utilisateur",
            description = "Crée un nouveau compte utilisateur. Les rôles disponibles sont: ADMIN, ANALYST, ADVISOR, MANAGER"
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
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflit - Email ou nom d'utilisateur déjà existant",
                    content = @Content
            )
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = userService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Déconnexion",
            description = "Déconnecte l'utilisateur. Le token doit être invalidé côté client."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Déconnexion réussie",
                    content = @Content
            )
    })
    public ResponseEntity<Void> logout() {
        // Logique de déconnexion (invalider le token côté client)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Rafraîchir le token JWT",
            description = "Génère un nouveau token JWT à partir d'un refresh token valide"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token rafraîchi avec succès",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token invalide ou expiré",
                    content = @Content
            )
    })
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        // Implémenter la logique de rafraîchissement du token
        return ResponseEntity.ok().build();
    }
}