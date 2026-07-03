package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertResponseDTO {

    private String id;
    private String clientId;
    private String clientName;
    private String creditRequestId;
    private String alertType;
    private String description;
    private RiskLevel severity;
    private String evidence;
    private String aiAnalysis;
    private boolean reviewed;
    private boolean confirmed;
    private boolean actionTaken;
    private String reviewedBy;
    private LocalDateTime createdAt;
}