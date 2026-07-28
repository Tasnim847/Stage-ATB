package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class CeilingConfigRequestDTO {

    @NotBlank(message = "L'ID du type de crédit est requis")
    private String creditTypeId;

    @NotNull(message = "Le montant minimum est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant minimum doit être supérieur à 0")
    private Double minAmount;

    @NotNull(message = "Le montant maximum est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant maximum doit être supérieur à 0")
    private Double maxAmount;

    private String currency = "TND";

    @NotBlank(message = "Le niveau d'approbation est requis")
    private String approvalLevel; // ADVISOR, ANALYST, MANAGER, DIRECTOR

    private Boolean requiresAdditionalApproval = false;

    private String additionalApprovalLevel; // MANAGER, DIRECTOR
}
