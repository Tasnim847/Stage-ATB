package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.KYCVerificationRequestDTO;
import org.example.stage_atb.dto.response.KYCVerificationResponseDTO;

import java.util.List;

public interface IKYCVService {

    KYCVerificationResponseDTO createKYCVerification(KYCVerificationRequestDTO kycVerificationRequestDTO);

    KYCVerificationResponseDTO getKYCVerificationById(String id);

    List<KYCVerificationResponseDTO> getKYCVerificationsByClient(String clientId);

    KYCVerificationResponseDTO getKYCVerificationByClientAndDocument(String clientId, String documentId);

    List<KYCVerificationResponseDTO> getAllKYCVerifications();

    KYCVerificationResponseDTO updateKYCVerification(String id, KYCVerificationRequestDTO kycVerificationRequestDTO);

    void deleteKYCVerification(String id);

    KYCVerificationResponseDTO performKYCVerification(String clientId);

    KYCVerificationResponseDTO verifyIdentity(String clientId, String documentId);

    KYCVerificationResponseDTO verifyAddress(String clientId, String documentId);

    KYCVerificationResponseDTO detectFraud(String clientId, String documentId);

    List<KYCVerificationResponseDTO> getPendingVerifications();

    List<KYCVerificationResponseDTO> getFraudDetected();
}