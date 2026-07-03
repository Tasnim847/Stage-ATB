package org.example.stage_atb.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête d'authentification")
public class LoginRequest {

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    @Schema(description = "Email de l'utilisateur", example = "admin@atb.com", required = true)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Schema(description = "Mot de passe de l'utilisateur", example = "password123", required = true)
    private String password;
}