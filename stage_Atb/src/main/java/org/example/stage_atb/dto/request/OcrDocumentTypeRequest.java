package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrDocumentTypeRequest {

    @NotBlank(message = "Le nom est requis")
    private String name;

    @NotBlank(message = "Le code est requis")
    @Pattern(regexp = "^[A-Z_]+$", message = "Le code doit être en majuscules avec underscores")
    private String code;

    private String description;

    private Boolean ocrEnabled = true;

    private Boolean required = false;

    @Min(value = 1, message = "La taille maximale doit être ≥ 1 MB")
    private Integer maxSize = 10;

    @NotEmpty(message = "Au moins un format est requis")
    private List<String> allowedFormats;

    private List<OcrFieldRequest> fields;

    private List<ValidationRuleRequest> validationRules;
}


