package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IKYCVService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.KYCVerificationRequestDTO;
import org.example.stage_atb.dto.response.KYCVerificationResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.KYCVerification;
import org.example.stage_atb.Mappers.KYCVerificationMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.KYCVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KYCVerificationServiceImpl implements IKYCVService {

    private final KYCVerificationRepository kycVerificationRepository;
    private final KYCVerificationMapper kycVerificationMapper;
    private final ClientRepository clientRepository;
    private final IUserService userService;

    @Override
    public KYCVerificationResponseDTO createKYCVerification(KYCVerificationRequestDTO requestDTO) {
        log.info("Creating KYC verification for client: {}", requestDTO.getClientId());

        KYCVerification kycVerification = kycVerificationMapper.toEntity(requestDTO);

        Client client = clientRepository.findById(requestDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        kycVerification.setClient(client);

        KYCVerification saved = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(saved);
    }

    @Override
    public KYCVerificationResponseDTO getKYCVerificationById(String id) {
        KYCVerification kycVerification = kycVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));
        return kycVerificationMapper.toResponseDTO(kycVerification);
    }

    @Override
    public List<KYCVerificationResponseDTO> getKYCVerificationsByClient(String clientId) {
        return kycVerificationRepository.findByClientId(clientId)
                .stream()
                .map(kycVerificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public KYCVerificationResponseDTO getKYCVerificationByClientAndDocument(String clientId, String documentId) {
        KYCVerification kycVerification = kycVerificationRepository.findByClientIdAndDocumentId(clientId, documentId)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));
        return kycVerificationMapper.toResponseDTO(kycVerification);
    }

    @Override
    public List<KYCVerificationResponseDTO> getAllKYCVerifications() {
        return kycVerificationRepository.findAll()
                .stream()
                .map(kycVerificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public KYCVerificationResponseDTO updateKYCVerification(String id, KYCVerificationRequestDTO requestDTO) {
        KYCVerification kycVerification = kycVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));

        kycVerificationMapper.updateEntity(kycVerification, requestDTO);

        KYCVerification updated = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteKYCVerification(String id) {
        if (!kycVerificationRepository.existsById(id)) {
            throw new RuntimeException("KYC verification not found");
        }
        kycVerificationRepository.deleteById(id);
    }

    @Override
    public KYCVerificationResponseDTO performKYCVerification(String clientId) {
        KYCVerification kycVerification = KYCVerification.builder()
                .client(clientRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found")))
                .verificationType("FULL_KYC")
                .identityVerified(true)
                .addressVerified(true)
                .documentAuthentic(true)
                .fraudDetected(false)
                .verificationStatus("COMPLETED")
                .verifiedAt(LocalDateTime.now())
                .verifiedBy(userService.getCurrentUser())
                .build();

        KYCVerification saved = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(saved);
    }

    @Override
    public KYCVerificationResponseDTO verifyIdentity(String clientId, String documentId) {
        KYCVerification kycVerification = kycVerificationRepository.findByClientIdAndDocumentId(clientId, documentId)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));

        kycVerification.setIdentityVerified(true);
        kycVerification.setVerificationStatus("IDENTITY_VERIFIED");
        kycVerification.setVerifiedAt(LocalDateTime.now());
        kycVerification.setVerifiedBy(userService.getCurrentUser());

        KYCVerification updated = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(updated);
    }

    @Override
    public KYCVerificationResponseDTO verifyAddress(String clientId, String documentId) {
        KYCVerification kycVerification = kycVerificationRepository.findByClientIdAndDocumentId(clientId, documentId)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));

        kycVerification.setAddressVerified(true);
        kycVerification.setVerificationStatus("ADDRESS_VERIFIED");
        kycVerification.setVerifiedAt(LocalDateTime.now());
        kycVerification.setVerifiedBy(userService.getCurrentUser());

        KYCVerification updated = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(updated);
    }

    @Override
    public KYCVerificationResponseDTO detectFraud(String clientId, String documentId) {
        KYCVerification kycVerification = kycVerificationRepository.findByClientIdAndDocumentId(clientId, documentId)
                .orElseThrow(() -> new RuntimeException("KYC verification not found"));

        // Simulation de détection de fraude
        boolean fraudDetected = false;
        String fraudDetails = null;

        kycVerification.setFraudDetected(fraudDetected);
        kycVerification.setFraudDetails(fraudDetails);
        kycVerification.setVerificationStatus(fraudDetected ? "FRAUD_DETECTED" : "CLEAR");
        kycVerification.setVerifiedAt(LocalDateTime.now());
        kycVerification.setVerifiedBy(userService.getCurrentUser());

        KYCVerification updated = kycVerificationRepository.save(kycVerification);
        return kycVerificationMapper.toResponseDTO(updated);
    }

    @Override
    public List<KYCVerificationResponseDTO> getPendingVerifications() {
        return kycVerificationRepository.findPendingVerifications()
                .stream()
                .map(kycVerificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<KYCVerificationResponseDTO> getFraudDetected() {
        return kycVerificationRepository.findFraudDetected()
                .stream()
                .map(kycVerificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}