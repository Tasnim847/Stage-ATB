package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ

@Data
public class RiskModelRequest {

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "Le statut actif est obligatoire")
    private Boolean isActive = true;

    @NotNull(message = "La priorité est obligatoire")
    @Min(value = 0, message = "La priorité doit être supérieure ou égale à 0")
    private Integer priority = 0;

    private Object configuration;
}