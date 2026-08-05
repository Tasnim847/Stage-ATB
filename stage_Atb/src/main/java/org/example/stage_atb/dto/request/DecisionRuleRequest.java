package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ


@Data
public class DecisionRuleRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    @NotBlank(message = "La condition est obligatoire")
    private String condition;

    @NotBlank(message = "L'action est obligatoire")
    private String action;

    @NotNull(message = "La priorité est obligatoire")
    @Min(value = 0, message = "La priorité doit être supérieure ou égale à 0")
    private Integer priority = 0;

    private Boolean isActive = true;
}