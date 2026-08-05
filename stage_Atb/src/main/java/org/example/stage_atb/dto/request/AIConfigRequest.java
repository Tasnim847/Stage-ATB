package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ
@Data
public class AIConfigRequest {

    @NotBlank(message = "Le fournisseur est obligatoire")
    private String provider;

    @NotBlank(message = "Le modèle est obligatoire")
    private String model;

    @NotNull(message = "La température est obligatoire")
    @Min(value = 0, message = "La température doit être entre 0 et 1")
    @Max(value = 1, message = "La température doit être entre 0 et 1")
    private Double temperature;

    private String systemPrompt;

    @NotBlank(message = "La langue est obligatoire")
    private String language;

    @NotNull(message = "Le score minimum est obligatoire")
    @Min(value = 0, message = "Le score minimum doit être entre 0 et 100")
    @Max(value = 100, message = "Le score minimum doit être entre 0 et 100")
    private Integer minScore = 0;

    private Boolean explanationRequired = true;

    private Boolean isActive = true;
}