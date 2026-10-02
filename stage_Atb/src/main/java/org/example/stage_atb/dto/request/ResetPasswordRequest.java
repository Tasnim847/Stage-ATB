// dto/request/ResetPasswordRequest.java
package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Le token est requis")
    private String token;

    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 6, message = "Minimum 6 caractères")
    private String newPassword;

    @NotBlank(message = "La confirmation est requise")
    private String confirmPassword;
}