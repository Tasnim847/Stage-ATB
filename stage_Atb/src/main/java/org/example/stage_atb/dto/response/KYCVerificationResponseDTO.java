package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KYCVerificationResponseDTO {

    private String id;

    private String clientId;

    private String clientName;

    private String documentId;

    private String documentName;

    private String verificationType;

    private Boolean identityVerified;

    private Boolean addressVerified;

    private Boolean documentAuthentic;

    private Boolean fraudDetected;

    private String fraudDetails;

    private String verificationStatus;

    private String verificationNotes;

    private String aiAnalysis;

    private String verifiedBy;

    private String verifiedByName;

    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}