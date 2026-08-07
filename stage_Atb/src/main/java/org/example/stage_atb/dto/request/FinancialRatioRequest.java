package org.example.stage_atb.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class FinancialRatioRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    private Double minValue;

    @NotNull(message = "La valeur maximale est obligatoire")
    private Double maxValue;

    private Double criticalMin;
    private Double criticalMax;

    // ✅ Permettre une chaîne vide avec @NotNull
    @NotNull(message = "L'unité est obligatoire")
    private String unit = "";

    private Boolean isActive = true;

    @NotNull(message = "La priorité est obligatoire")
    private Integer priority;
}