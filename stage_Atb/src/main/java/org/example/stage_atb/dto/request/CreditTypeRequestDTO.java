package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTypeRequestDTO {

    @NotBlank(message = "Le code est requis")
    @Size(min = 3, max = 10, message = "Le code doit contenir entre 3 et 10 caractères")
    private String code;

    @NotBlank(message = "Le nom est requis")
    @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
    private String name;

    @NotBlank(message = "La description est requise")
    @Size(max = 255, message = "La description ne peut pas dépasser 255 caractères")
    private String description;

    @NotBlank(message = "La catégorie est requise")
    private String category;

    @NotNull(message = "La durée minimale est requise")
    @Min(value = 1, message = "La durée minimale doit être au moins 1 mois")
    private Integer minDurationMonths;

    @NotNull(message = "La durée maximale est requise")
    @Min(value = 1, message = "La durée maximale doit être au moins 1 mois")
    private Integer maxDurationMonths;

    @NotNull(message = "Le montant minimum est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant minimum doit être supérieur à 0")
    private Double minAmount;

    @NotNull(message = "Le montant maximum est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant maximum doit être supérieur à 0")
    private Double maxAmount;

    @NotNull(message = "Le taux d'intérêt de base est requis")
    @DecimalMin(value = "0.0", message = "Le taux d'intérêt doit être positif")
    @DecimalMax(value = "100.0", message = "Le taux d'intérêt ne peut pas dépasser 100%")
    private Double baseInterestRate;

    private Boolean requiresCollateral = false;
    private Boolean requiresGuarantor = false;
    private List<String> requiredDocuments;

    // ✅ AJOUTER CES CHAMPS
    private List<Integer> availableDurations; // Durées disponibles pour ce type
    private Double defaultInterestRate; // Taux par défaut
}
