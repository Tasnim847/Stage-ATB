package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRuleRequest {

    @NotBlank(message = "Le nom de la règle est requis")
    private String name;

    @NotBlank(message = "La condition est requise")
    private String condition;

    @NotBlank(message = "La valeur est requise")
    private String value;

    private String value2;

    @NotBlank(message = "L'action est requise")
    private String action;

    @NotBlank(message = "Le message est requis")
    private String message;

    private Boolean active = true;
}