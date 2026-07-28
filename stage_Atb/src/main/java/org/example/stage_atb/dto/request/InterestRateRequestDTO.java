package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRateRequestDTO {

    @NotBlank(message = "L'ID du type de crédit est requis")
    private String creditTypeId;

    @NotNull(message = "Le taux est requis")
    @DecimalMin(value = "0.0", message = "Le taux doit être positif")
    @DecimalMax(value = "100.0", message = "Le taux ne peut pas dépasser 100%")
    private Double rate;

    @DecimalMin(value = "0.0", message = "Le taux minimum doit être positif")
    private Double minRate;

    @DecimalMax(value = "100.0", message = "Le taux maximum ne peut pas dépasser 100%")
    private Double maxRate;

    private Boolean isDefault = false;

    private String clientCategory; // PREMIUM, STANDARD, RISK

    private Double rateAdjustment;

    @NotNull(message = "La date d'effet est requise")
    private LocalDateTime effectiveDate;

    private LocalDateTime expiryDate;
}
