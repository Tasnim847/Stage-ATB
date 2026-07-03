package org.example.stage_atb.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse d'erreur")
public class ErrorResponse {

    @Schema(description = "Code d'erreur", example = "UNAUTHORIZED")
    private String errorCode;

    @Schema(description = "Message d'erreur", example = "Email ou mot de passe incorrect")
    private String message;

    @Schema(description = "Horodatage de l'erreur", example = "2026-07-03T14:30:00")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Schema(description = "Chemin de la requête", example = "/api/auth/login")
    private String path;

    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String errorCode, String message, String path) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }
}