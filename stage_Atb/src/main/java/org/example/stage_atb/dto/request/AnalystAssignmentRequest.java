// dto/request/AnalystAssignmentRequest.java
package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalystAssignmentRequest {

    @NotBlank(message = "Credit request ID is required")
    private String creditRequestId;

    @NotBlank(message = "Analyst ID is required")
    private String analystId;

    private String notes;

    @NotNull
    private boolean forceAssign;
}