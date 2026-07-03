package org.example.stage_atb.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KYCVerificationRequestDTO {

    private String clientId;
    private String documentId;
    private String verificationType;
    private Boolean identityVerified;
    private Boolean addressVerified;
    private Boolean documentAuthentic;
    private String verificationNotes;
}