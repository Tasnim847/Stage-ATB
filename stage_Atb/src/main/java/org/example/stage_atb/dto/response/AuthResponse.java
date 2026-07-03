package org.example.stage_atb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse d'authentification")
public class AuthResponse {

    @Schema(description = "ID de l'utilisateur", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;

    @Schema(description = "Nom d'utilisateur", example = "johndoe")
    private String username;

    @Schema(description = "Email de l'utilisateur", example = "john.doe@atb.com")
    private String email;

    @Schema(description = "Prénom", example = "John")
    private String firstName;

    @Schema(description = "Nom", example = "Doe")
    private String lastName;

    @Schema(description = "Rôle de l'utilisateur", example = "ANALYST")
    private UserRole role;

    @Schema(description = "Token JWT d'accès", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "Token JWT de rafraîchissement", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Date d'expiration du token", example = "2026-07-04T10:00:00")
    private LocalDateTime expirationDate;

    @Schema(description = "Message de bienvenue", example = "Bienvenue John Doe!")
    private String message;
}