package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertRequestDTO {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    private String creditRequestId;

    @NotBlank(message = "Alert type is required")
    private String alertType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Severity is required")
    private RiskLevel severity;

    private String evidence;

    private String aiAnalysis;

    private Boolean reviewed;

    private Boolean confirmed;

    private Boolean actionTaken;

    private String actionNotes;
}