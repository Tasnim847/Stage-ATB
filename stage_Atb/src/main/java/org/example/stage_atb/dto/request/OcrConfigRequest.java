package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrConfigRequest {

    @NotBlank(message = "Le fournisseur OCR est requis")
    private String provider;

    @NotBlank(message = "La clé API est requise")
    private String apiKey;

    @NotBlank(message = "L'URL du service est requise")
    @Pattern(regexp = "^https?://.*$", message = "Format d'URL invalide")
    private String endpoint;

    @NotEmpty(message = "Au moins une langue est requise")
    private List<String> languages;

    @Min(value = 0, message = "La confiance minimale doit être ≥ 0")
    @Max(value = 100, message = "La confiance minimale doit être ≤ 100")
    private Integer minConfidence = 85;

    private Boolean enabled = true;

    @Min(value = 0, message = "Le nombre de tentatives doit être ≥ 0")
    @Max(value = 5, message = "Le nombre de tentatives doit être ≤ 5")
    private Integer maxRetries = 3;

    @Min(value = 5, message = "Le timeout doit être ≥ 5 secondes")
    private Integer timeout = 30;

    private Boolean autoSync = false;
}
