package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ

@Data
public class RiskThresholdRequest {

    @NotNull(message = "Le score minimum est obligatoire")
    @Min(value = 0, message = "Le score minimum doit être entre 0 et 100")
    @Max(value = 100, message = "Le score minimum doit être entre 0 et 100")
    private Integer minScore;

    @NotNull(message = "Le score maximum est obligatoire")
    @Min(value = 0, message = "Le score maximum doit être entre 0 et 100")
    @Max(value = 100, message = "Le score maximum doit être entre 0 et 100")
    private Integer maxScore;

    @NotBlank(message = "Le niveau est obligatoire")
    private String level;

    @NotBlank(message = "Le label est obligatoire")
    private String label;

    @NotBlank(message = "La couleur est obligatoire")
    private String color;

    @NotBlank(message = "Le niveau d'alerte est obligatoire")
    private String alertLevel;

    private Boolean isActive = true;
}