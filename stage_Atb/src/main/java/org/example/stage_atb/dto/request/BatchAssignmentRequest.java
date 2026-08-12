// dto/request/BatchAssignmentRequest.java
package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchAssignmentRequest {

    @NotEmpty(message = "Assignment list cannot be empty")
    private List<SingleAssignment> assignments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SingleAssignment {
        @NotBlank(message = "Credit request ID is required")
        private String creditRequestId;

        @NotBlank(message = "Analyst ID is required")
        private String analystId;
    }
}