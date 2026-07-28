package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DurationConfigRequestDTO {

    @NotBlank(message = "L'ID du type de crédit est requis")
    private String creditTypeId;

    @NotNull(message = "La durée en mois est requise")
    @Min(value = 1, message = "La durée doit être au moins 1 mois")
    private Integer durationMonths;

    @NotBlank(message = "Le label est requis")
    private String label;

    private Boolean isDefault = false;

    private Double minAmount;
    private Double maxAmount;
}
