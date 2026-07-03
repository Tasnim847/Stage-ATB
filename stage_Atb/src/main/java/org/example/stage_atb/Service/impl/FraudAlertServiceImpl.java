package org.example.stage_atb.Service.impl;


import org.example.stage_atb.Service.IFraudAlertService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.FraudAlertRequestDTO;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FraudAlert;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.RiskLevel;
import org.example.stage_atb.Mappers.FraudAlertMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.FraudAlertRepository;
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
public class FraudAlertServiceImpl implements IFraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;
    private final FraudAlertMapper fraudAlertMapper;
    private final ClientRepository clientRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final IUserService userService;

    @Override
    public FraudAlertResponseDTO createFraudAlert(FraudAlertRequestDTO requestDTO) {
        log.info("Creating fraud alert for client: {}", requestDTO.getClientId());

        // Vérifier que le client existe
        Client client = clientRepository.findById(requestDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + requestDTO.getClientId()));

        // Créer l'alerte
        FraudAlert fraudAlert = fraudAlertMapper.toEntity(requestDTO);
        fraudAlert.setClient(client);

        // Si creditRequestId est fourni, vérifier qu'il existe
        if (requestDTO.getCreditRequestId() != null && !requestDTO.getCreditRequestId().isEmpty()) {
            CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                    .orElseThrow(() -> new RuntimeException("Credit request not found"));
            fraudAlert.setCreditRequest(creditRequest);
        }

        // Définir les valeurs par défaut
        fraudAlert.setReviewed(false);
        fraudAlert.setConfirmed(false);
        fraudAlert.setActionTaken(false);

        FraudAlert savedAlert = fraudAlertRepository.save(fraudAlert);
        log.info("Fraud alert created with id: {}", savedAlert.getId());

        return fraudAlertMapper.toResponseDTO(savedAlert);
    }

    @Override
    public FraudAlertResponseDTO getFraudAlertById(String id) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found with id: " + id));
        return fraudAlertMapper.toResponseDTO(fraudAlert);
    }

    @Override
    public List<FraudAlertResponseDTO> getFraudAlertsByClient(String clientId) {
        return fraudAlertRepository.findByClientId(clientId)
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudAlertResponseDTO> getFraudAlertsByCreditRequest(String creditRequestId) {
        return fraudAlertRepository.findByCreditRequestId(creditRequestId)
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudAlertResponseDTO> getFraudAlertsBySeverity(RiskLevel severity) {
        return fraudAlertRepository.findBySeverity(severity)
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudAlertResponseDTO> getAllFraudAlerts() {
        return fraudAlertRepository.findAll()
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FraudAlertResponseDTO updateFraudAlert(String id, FraudAlertRequestDTO requestDTO) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found with id: " + id));

        fraudAlertMapper.updateEntity(fraudAlert, requestDTO);

        // Mettre à jour le client si nécessaire
        if (requestDTO.getClientId() != null && !requestDTO.getClientId().isEmpty()) {
            Client client = clientRepository.findById(requestDTO.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            fraudAlert.setClient(client);
        }

        // Mettre à jour la demande de crédit si nécessaire
        if (requestDTO.getCreditRequestId() != null && !requestDTO.getCreditRequestId().isEmpty()) {
            CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                    .orElseThrow(() -> new RuntimeException("Credit request not found"));
            fraudAlert.setCreditRequest(creditRequest);
        }

        FraudAlert updatedAlert = fraudAlertRepository.save(fraudAlert);
        return fraudAlertMapper.toResponseDTO(updatedAlert);
    }

    @Override
    public void deleteFraudAlert(String id) {
        if (!fraudAlertRepository.existsById(id)) {
            throw new RuntimeException("Fraud alert not found with id: " + id);
        }
        fraudAlertRepository.deleteById(id);
        log.info("Fraud alert deleted with id: {}", id);
    }

    @Override
    public FraudAlertResponseDTO reviewFraudAlert(String id) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found with id: " + id));

        User currentUser = userService.getCurrentUser();

        fraudAlert.setReviewed(true);
        fraudAlert.setReviewedBy(currentUser);
        fraudAlert.setUpdatedAt(LocalDateTime.now());

        FraudAlert updatedAlert = fraudAlertRepository.save(fraudAlert);
        log.info("Fraud alert reviewed: {} by {}", id, currentUser.getEmail());

        return fraudAlertMapper.toResponseDTO(updatedAlert);
    }

    @Override
    public FraudAlertResponseDTO confirmFraudAlert(String id) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found with id: " + id));

        fraudAlert.setConfirmed(true);
        fraudAlert.setReviewed(true);
        fraudAlert.setUpdatedAt(LocalDateTime.now());

        FraudAlert updatedAlert = fraudAlertRepository.save(fraudAlert);
        log.info("Fraud alert confirmed: {}", id);

        return fraudAlertMapper.toResponseDTO(updatedAlert);
    }

    @Override
    public FraudAlertResponseDTO takeAction(String id, String actionNotes) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found with id: " + id));

        fraudAlert.setActionTaken(true);
        fraudAlert.setActionNotes(actionNotes);
        fraudAlert.setUpdatedAt(LocalDateTime.now());

        FraudAlert updatedAlert = fraudAlertRepository.save(fraudAlert);
        log.info("Action taken on fraud alert: {}, notes: {}", id, actionNotes);

        return fraudAlertMapper.toResponseDTO(updatedAlert);
    }

    @Override
    public List<FraudAlertResponseDTO> getUnreviewedAlerts() {
        return fraudAlertRepository.findUnreviewedAlerts()
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudAlertResponseDTO> getConfirmedUnresolvedAlerts() {
        return fraudAlertRepository.findConfirmedUnresolvedAlerts()
                .stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FraudAlertResponseDTO detectFraudWithAI(String creditRequestId) {
        log.info("Detecting fraud with AI for credit request: {}", creditRequestId);

        CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + creditRequestId));

        // Simulation de détection de fraude par IA
        // Dans la réalité, vous appelleriez ici un service IA externe
        FraudAlert fraudAlert = performAIFraudDetection(creditRequest);

        FraudAlert savedAlert = fraudAlertRepository.save(fraudAlert);
        log.info("Fraud detection completed for credit request: {}, alert id: {}", creditRequestId, savedAlert.getId());

        return fraudAlertMapper.toResponseDTO(savedAlert);
    }

    /**
     * Méthode privée pour simuler la détection de fraude par IA
     */
    private FraudAlert performAIFraudDetection(CreditRequest creditRequest) {
        Client client = creditRequest.getClient();

        // Construction de l'alerte
        FraudAlert.FraudAlertBuilder alertBuilder = FraudAlert.builder()
                .client(client)
                .creditRequest(creditRequest)
                .reviewed(false)
                .confirmed(false)
                .actionTaken(false)
                .createdAt(LocalDateTime.now());

        // Simulation de différentes détections
        boolean fraudDetected = false;
        String alertType = "NORMAL";
        String description = "Aucune fraude détectée";
        RiskLevel severity = RiskLevel.LOW;
        String evidence = "Tous les documents semblent authentiques";
        String aiAnalysis = "Analyse IA: Aucune anomalie détectée";

        // Simuler une détection basée sur le montant ou d'autres critères
        if (creditRequest.getAmount() != null &&
                creditRequest.getAmount().compareTo(new java.math.BigDecimal("1000000")) > 0) {
            fraudDetected = true;
            alertType = "HIGH_AMOUNT";
            description = "Montant élevé détecté pour ce profil client";
            severity = RiskLevel.HIGH;
            evidence = "Montant demandé: " + creditRequest.getAmount();
            aiAnalysis = "Analyse IA: Risque élevé - Montant disproportionné par rapport au profil";
        }

        // Simuler une détection basée sur l'historique
        if (creditRequest.getClient().getClientScoring() != null) {
            java.math.BigDecimal score = creditRequest.getClient().getClientScoring().getOverallScore();
            if (score != null && score.compareTo(new java.math.BigDecimal("300")) < 0) {
                fraudDetected = true;
                alertType = "LOW_SCORE";
                description = "Score client trop bas pour ce montant de crédit";
                severity = RiskLevel.HIGH;
                evidence = "Score client: " + score;
                aiAnalysis = "Analyse IA: Risque de fraude - Score client incompatible avec la demande";
            }
        }

        if (fraudDetected) {
            alertBuilder.alertType(alertType)
                    .description(description)
                    .severity(severity)
                    .evidence(evidence)
                    .aiAnalysis(aiAnalysis);
        } else {
            alertBuilder.alertType("CLEAR")
                    .description("Aucune fraude détectée")
                    .severity(RiskLevel.LOW)
                    .evidence("Documentation conforme")
                    .aiAnalysis("Analyse IA: Aucun signe de fraude détecté");
        }

        return alertBuilder.build();
    }
}