package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ

@Data
public class FraudRuleRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "Le poids est obligatoire")
    @Min(value = 0, message = "Le poids doit être supérieur ou égal à 0")
    private Integer weight;

    private Boolean isActive = true;

    @NotNull(message = "Le seuil est obligatoire")
    @Min(value = 0, message = "Le seuil doit être entre 0 et 100")
    @Max(value = 100, message = "Le seuil doit être entre 0 et 100")
    private Integer threshold;
}
