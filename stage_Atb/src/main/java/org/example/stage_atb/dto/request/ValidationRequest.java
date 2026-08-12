// dto/request/ValidationRequest.java
package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRequest {

    @NotBlank(message = "Credit request ID is required")
    private String creditRequestId;

    @NotBlank(message = "Decision is required")
    private String decision; // APPROVED, REJECTED, RETURN_TO_ANALYST

    private String comments;

    @NotNull
    private BigDecimal maxAmountLimit = BigDecimal.valueOf(500000); // Seuil par défaut

    private boolean overrideLimit;

    private String overrideReason;
}