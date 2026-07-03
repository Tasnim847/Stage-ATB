package org.example.stage_atb.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CopilotAnalysisRequestDTO {

    private String creditRequestId;
    private String analysisRequest;
    private String additionalContext;
}