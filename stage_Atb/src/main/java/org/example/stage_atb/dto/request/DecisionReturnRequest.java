// dto/request/DecisionReturnRequest.java
package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionReturnRequest {

    @NotBlank(message = "Credit request ID is required")
    private String creditRequestId;

    @NotBlank(message = "Return reason is required")
    private String reason;

    private String additionalInstructions;

    @NotBlank(message = "Action required is required")
    private String requiredAction; // CORRECT_DOCUMENTS, REANALYZE_FINANCIALS, ADD_INFORMATION
}