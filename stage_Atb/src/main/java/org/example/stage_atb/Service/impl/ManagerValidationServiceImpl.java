// Service/impl/ManagerValidationServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.CreditRequestMapper;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IManagerValidationService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.DecisionReturnRequest;
import org.example.stage_atb.dto.request.ValidationRequest;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.ValidationResponseDTO;
import org.example.stage_atb.dto.response.ValidationSummaryDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManagerValidationServiceImpl implements IManagerValidationService {

    private final CreditRequestRepository creditRequestRepository;
    private final CreditRequestMapper creditRequestMapper;
    private final UserRepository userRepository;
    private final IUserService userService;

    // Seuils par défaut
    private static final BigDecimal HIGH_AMOUNT_THRESHOLD = BigDecimal.valueOf(500000);
    private static final BigDecimal HIGH_RISK_THRESHOLD = BigDecimal.valueOf(70);
    private static final List<CreditStatus> PENDING_VALIDATION_STATUSES = Arrays.asList(
            CreditStatus.UNDER_REVIEW,
            CreditStatus.PENDING_ANALYSIS
    );

    private static final List<CreditStatus> VALIDATED_STATUSES = Arrays.asList(
            CreditStatus.APPROVED,
            CreditStatus.REJECTED
    );

    // ============================================
    // VALIDER LES DÉCISIONS IMPORTANTES
    // ============================================

    @Override
    public List<ValidationSummaryDTO> getPendingValidations() {
        log.info("📋 Récupération des dossiers en attente de validation manager");

        List<CreditRequest> pendingRequests = creditRequestRepository
                .findPendingManagerValidation(
                        CreditStatus.UNDER_REVIEW,
                        HIGH_AMOUNT_THRESHOLD,
                        HIGH_RISK_THRESHOLD
                );

        log.info("✅ {} dossiers en attente de validation", pendingRequests.size());
        return pendingRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    @Override
    public List<ValidationSummaryDTO> getHighAmountValidations(BigDecimal minAmount) {
        log.info("📋 Récupération des crédits élevés à valider (>= {})", minAmount);

        List<CreditRequest> highAmountRequests = creditRequestRepository
                .findHighAmountRequestsForManager(
                        CreditStatus.UNDER_REVIEW,
                        minAmount != null ? minAmount : HIGH_AMOUNT_THRESHOLD
                );

        log.info("✅ {} crédits élevés trouvés", highAmountRequests.size());
        return highAmountRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    @Override
    public List<ValidationSummaryDTO> getHighRiskValidations(BigDecimal riskThreshold) {
        log.info("📋 Récupération des crédits à haut risque à valider (>= {})", riskThreshold);

        List<CreditRequest> highRiskRequests = creditRequestRepository
                .findHighRiskRequestsForManager(
                        CreditStatus.UNDER_REVIEW,
                        riskThreshold != null ? riskThreshold : HIGH_RISK_THRESHOLD
                );

        log.info("✅ {} crédits à haut risque trouvés", highRiskRequests.size());
        return highRiskRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    @Override
    public List<ValidationSummaryDTO> getPendingValidationsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📋 Récupération des validations en attente entre {} et {}", startDate, endDate);

        List<CreditRequest> pendingRequests = creditRequestRepository
                .findPendingManagerValidationByDateRange(CreditStatus.UNDER_REVIEW, startDate, endDate);

        return pendingRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    @Override
    public ValidationResponseDTO validateDecision(ValidationRequest request) {
        log.info("📋 Validation de la décision pour le dossier: {}", request.getCreditRequestId());

        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Seul un manager peut valider les décisions");
        }

        CreditRequest creditRequest = creditRequestRepository
                .findById(request.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + request.getCreditRequestId()));

        // Vérifier que le dossier est en attente de validation
        if (creditRequest.getStatus() != CreditStatus.UNDER_REVIEW) {
            throw new RuntimeException("Le dossier n'est pas en attente de validation. Statut actuel: " + creditRequest.getStatus());
        }

        // Vérifier si une validation manager est nécessaire
        if (!request.isOverrideLimit() && !requiresManagerValidation(creditRequestMapper.toResponseDTO(creditRequest))) {
            log.warn("⚠️ Le dossier {} ne nécessite pas de validation manager", creditRequest.getRequestNumber());
        }

        // Appliquer la décision du manager
        CreditStatus newStatus;
        String decision = request.getDecision().toUpperCase();

        switch (decision) {
            case "APPROVED":
                newStatus = CreditStatus.APPROVED;
                creditRequest.setApprovalDate(LocalDateTime.now().toLocalDate());
                log.info("✅ Dossier {} approuvé par le manager", creditRequest.getRequestNumber());
                break;

            case "REJECTED":
                newStatus = CreditStatus.REJECTED;
                creditRequest.setRejectionReason(request.getComments());
                log.info("❌ Dossier {} rejeté par le manager", creditRequest.getRequestNumber());
                break;

            case "RETURN_TO_ANALYST":
                newStatus = CreditStatus.PENDING_ANALYSIS;
                log.info("🔄 Dossier {} retourné à l'analyste par le manager", creditRequest.getRequestNumber());
                break;

            default:
                throw new RuntimeException("Décision invalide: " + decision);
        }

        creditRequest.setStatus(newStatus);
        creditRequest.setUpdatedAt(LocalDateTime.now());
        creditRequest.setManagerValidationRequired(true);

        // Sauvegarder
        CreditRequest savedRequest = creditRequestRepository.save(creditRequest);

        log.info("✅ Dossier {} validé avec succès par le manager. Nouveau statut: {}",
                savedRequest.getRequestNumber(), newStatus);

        return convertToValidationResponse(savedRequest, currentUser);
    }

    @Override
    public ValidationResponseDTO approveHighAmountCredit(String creditRequestId, String comments) {
        log.info("📋 Approbation du crédit élevé: {}", creditRequestId);

        ValidationRequest request = ValidationRequest.builder()
                .creditRequestId(creditRequestId)
                .decision("APPROVED")
                .comments(comments)
                .overrideLimit(true)
                .build();

        return validateDecision(request);
    }

    @Override
    public ValidationResponseDTO rejectDecision(String creditRequestId, String reason, String comments) {
        log.info("📋 Rejet de la décision pour le dossier: {}", creditRequestId);

        ValidationRequest request = ValidationRequest.builder()
                .creditRequestId(creditRequestId)
                .decision("REJECTED")
                .comments(reason + (comments != null ? " - " + comments : ""))
                .overrideLimit(true)
                .build();

        return validateDecision(request);
    }

    @Override
    public ValidationResponseDTO returnToAnalyst(DecisionReturnRequest request) {
        log.info("📋 Retour du dossier {} à l'analyste", request.getCreditRequestId());

        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Seul un manager peut retourner un dossier à l'analyste");
        }

        CreditRequest creditRequest = creditRequestRepository
                .findById(request.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + request.getCreditRequestId()));

        if (creditRequest.getStatus() != CreditStatus.UNDER_REVIEW) {
            throw new RuntimeException("Le dossier n'est pas en attente de validation. Statut actuel: " + creditRequest.getStatus());
        }

        // Changer le statut
        creditRequest.setStatus(CreditStatus.PENDING_ANALYSIS);
        creditRequest.setRejectionReason(
                "Retourné par le manager: " + request.getReason() +
                        (request.getAdditionalInstructions() != null ? " - " + request.getAdditionalInstructions() : "")
        );
        creditRequest.setUpdatedAt(LocalDateTime.now());
        creditRequest.setManagerValidationRequired(false);

        CreditRequest savedRequest = creditRequestRepository.save(creditRequest);

        log.info("✅ Dossier {} retourné à l'analyste par le manager. Action requise: {}",
                savedRequest.getRequestNumber(), request.getRequiredAction());

        return convertToValidationResponse(savedRequest, currentUser);
    }

    // ============================================
    // STATISTIQUES ET SUIVI
    // ============================================

    @Override
    public Map<String, Object> getValidationStats() {
        log.info("📊 Récupération des statistiques de validation");

        Map<String, Object> stats = new HashMap<>();

        // Nombre de validations en attente
        long pendingCount = creditRequestRepository.countPendingManagerValidation(
                CreditStatus.UNDER_REVIEW,
                HIGH_AMOUNT_THRESHOLD,
                HIGH_RISK_THRESHOLD
        );

        // Nombre de validations effectuées
        long validatedCount = creditRequestRepository.countManagerValidated(VALIDATED_STATUSES);

        // Répartition par décision
        List<CreditRequest> approvedRequests = creditRequestRepository.findByStatus(CreditStatus.APPROVED);
        List<CreditRequest> rejectedRequests = creditRequestRepository.findByStatus(CreditStatus.REJECTED);

        long approvedCount = approvedRequests.stream()
                .filter(CreditRequest::isManagerValidationRequired)
                .count();

        long rejectedCount = rejectedRequests.stream()
                .filter(CreditRequest::isManagerValidationRequired)
                .count();

        // Montants moyens
        BigDecimal averageApprovedAmount = approvedRequests.stream()
                .filter(CreditRequest::isManagerValidationRequired)
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(1, approvedRequests.stream()
                        .filter(CreditRequest::isManagerValidationRequired)
                        .count())), 2, BigDecimal.ROUND_HALF_UP);

        stats.put("pendingValidations", pendingCount);
        stats.put("validatedCount", validatedCount);
        stats.put("approvedCount", approvedCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("averageApprovedAmount", averageApprovedAmount);
        stats.put("highAmountThreshold", HIGH_AMOUNT_THRESHOLD);
        stats.put("highRiskThreshold", HIGH_RISK_THRESHOLD);

        return stats;
    }

    @Override
    public List<ValidationResponseDTO> getValidationHistory(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📋 Récupération de l'historique des validations entre {} et {}", startDate, endDate);

        List<CreditRequest> validatedRequests = creditRequestRepository
                .findByDateRange(startDate, endDate)
                .stream()
                .filter(cr -> cr.isManagerValidationRequired() &&
                        (cr.getStatus() == CreditStatus.APPROVED || cr.getStatus() == CreditStatus.REJECTED))
                .collect(Collectors.toList());

        return validatedRequests.stream()
                .map(cr -> convertToValidationResponse(cr, null))
                .collect(Collectors.toList());
    }

    @Override
    public ValidationResponseDTO getValidationDetails(String creditRequestId) {
        log.info("📋 Récupération des détails de validation pour le dossier: {}", creditRequestId);

        CreditRequest creditRequest = creditRequestRepository
                .findById(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + creditRequestId));

        return convertToValidationResponse(creditRequest, null);
    }

    @Override
    public boolean requiresManagerValidation(CreditResponseDTO creditRequest) {
        if (creditRequest == null) return false;

        boolean isHighAmount = creditRequest.getAmount() != null &&
                creditRequest.getAmount().compareTo(HIGH_AMOUNT_THRESHOLD) >= 0;

        boolean isHighRisk = creditRequest.getRiskScore() != null &&
                creditRequest.getRiskScore().compareTo(HIGH_RISK_THRESHOLD) >= 0;

        boolean isComplex = "COMPLEX".equals(creditRequest.getRiskLevel()) ||
                "HIGH".equals(creditRequest.getRiskLevel());

        return isHighAmount || isHighRisk || isComplex;
    }

    @Override
    public String generateValidationReport(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Génération du rapport de validation pour la période: {} - {}", startDate, endDate);

        List<ValidationResponseDTO> validations = getValidationHistory(startDate, endDate);

        StringBuilder report = new StringBuilder();
        report.append("═══════════════════════════════════════════════════════════════════\n");
        report.append("                  📊 RAPPORT DE VALIDATION MANAGER                \n");
        report.append("═══════════════════════════════════════════════════════════════════\n\n");

        report.append("📅 Période: ").append(startDate.toLocalDate())
                .append(" → ").append(endDate.toLocalDate()).append("\n\n");

        // Statistiques
        long totalValidations = validations.size();
        long approvedCount = validations.stream()
                .filter(v -> "APPROVED".equals(v.getManagerDecision()))
                .count();
        long rejectedCount = validations.stream()
                .filter(v -> "REJECTED".equals(v.getManagerDecision()))
                .count();
        long returnedCount = validations.stream()
                .filter(v -> "RETURNED".equals(v.getManagerDecision()))
                .count();

        report.append("📈 RÉSUMÉ DES VALIDATIONS:\n");
        report.append("   ├─ Total validations: ").append(totalValidations).append("\n");
        report.append("   ├─ Approuvés: ").append(approvedCount)
                .append(" (").append(totalValidations > 0 ? Math.round((double) approvedCount / totalValidations * 100) : 0)
                .append("%)\n");
        report.append("   ├─ Rejetés: ").append(rejectedCount)
                .append(" (").append(totalValidations > 0 ? Math.round((double) rejectedCount / totalValidations * 100) : 0)
                .append("%)\n");
        report.append("   └─ Retournés à l'analyste: ").append(returnedCount)
                .append(" (").append(totalValidations > 0 ? Math.round((double) returnedCount / totalValidations * 100) : 0)
                .append("%)\n\n");

        // Détails des validations
        report.append("📋 DÉTAIL DES VALIDATIONS:\n");
        report.append("─────────────────────────────────────────────────────────────────\n");

        for (int i = 0; i < Math.min(validations.size(), 20); i++) {
            ValidationResponseDTO v = validations.get(i);
            report.append(String.format("   %d. %s\n", i + 1, v.getRequestNumber()));
            report.append(String.format("      ├─ Client: %s\n", v.getClientName()));
            report.append(String.format("      ├─ Montant: %,.0f TND\n", v.getAmount()));
            report.append(String.format("      ├─ Décision manager: %s\n", v.getManagerDecision()));
            report.append(String.format("      └─ Date: %s\n", v.getManagerDecisionDate()));
        }

        if (validations.size() > 20) {
            report.append("\n   ... et ").append(validations.size() - 20).append(" autres validations\n");
        }

        report.append("\n═══════════════════════════════════════════════════════════════════\n");
        report.append("              ℹ️  Rapport généré le ")
                .append(LocalDateTime.now()).append("\n");
        report.append("═══════════════════════════════════════════════════════════════════\n");

        return report.toString();
    }

    // ============================================
    // MÉTHODES PRIVÉES DE CONVERSION
    // ============================================

    private ValidationSummaryDTO convertToSummary(CreditRequest request) {
        boolean isHighAmount = request.getAmount() != null &&
                request.getAmount().compareTo(HIGH_AMOUNT_THRESHOLD) >= 0;

        boolean isHighRisk = request.getRiskAnalysis() != null &&
                request.getRiskAnalysis().getRiskScore() != null &&
                request.getRiskAnalysis().getRiskScore().compareTo(HIGH_RISK_THRESHOLD) >= 0;

        int daysPending = (int) ChronoUnit.DAYS.between(
                request.getCreatedAt(), LocalDateTime.now()
        );

        String priority = isHighAmount && isHighRisk ? "CRITICAL" :
                isHighAmount || isHighRisk ? "HIGH" : "NORMAL";

        return ValidationSummaryDTO.builder()
                .id(request.getId())
                .requestNumber(request.getRequestNumber())
                .clientName(request.getClient().getFirstName() + " " + request.getClient().getLastName())
                .amount(request.getAmount())
                .creditType(request.getCreditType() != null ? request.getCreditType().getName() : "Non défini")
                .riskLevel(request.getRiskAnalysis() != null && request.getRiskAnalysis().getOverallRisk() != null ?
                        request.getRiskAnalysis().getOverallRisk().toString() : "NON ÉVALUÉ")
                .analystName(getAnalystName(request))
                .analystDecision(request.getStatus().toString())
                .analystDecisionDate(request.getUpdatedAt())
                .requiresManagerValidation(true)
                .managerDecision("PENDING")
                .managerDecisionDate(null)
                .daysPending(daysPending)
                .priority(priority)
                .build();
    }

    private ValidationResponseDTO convertToValidationResponse(CreditRequest request, User manager) {
        boolean requiresValidation = requiresManagerValidation(creditRequestMapper.toResponseDTO(request));

        return ValidationResponseDTO.builder()
                .id(request.getId())
                .requestNumber(request.getRequestNumber())
                .clientName(request.getClient().getFirstName() + " " + request.getClient().getLastName())
                .clientEmail(request.getClient().getEmail())
                .amount(request.getAmount())
                .creditType(request.getCreditType() != null ? request.getCreditType().getName() : "Non défini")
                .durationMonths(request.getDurationMonths())
                .monthlyPayment(request.getMonthlyPayment())
                .status(request.getStatus())
                .analystDecision(request.getStatus().toString())
                .analystName(getAnalystName(request))
                .analystDecisionDate(request.getUpdatedAt())
                .managerName(manager != null ? manager.getFirstName() + " " + manager.getLastName() : null)
                .managerDecision(request.getStatus() == CreditStatus.APPROVED ? "APPROVED" :
                        request.getStatus() == CreditStatus.REJECTED ? "REJECTED" :
                                request.getStatus() == CreditStatus.PENDING_ANALYSIS ? "RETURNED" : null)
                .managerDecisionDate(LocalDateTime.now())
                .isHighAmount(request.getAmount() != null &&
                        request.getAmount().compareTo(HIGH_AMOUNT_THRESHOLD) >= 0)
                .riskLevel(request.getRiskAnalysis() != null && request.getRiskAnalysis().getOverallRisk() != null ?
                        request.getRiskAnalysis().getOverallRisk().toString() : "NON ÉVALUÉ")
                .riskScore(request.getRiskAnalysis() != null ?
                        request.getRiskAnalysis().getRiskScore() : null)
                .requiresManagerValidation(requiresValidation)
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private String getAnalystName(CreditRequest request) {
        if (request.getClient() != null && request.getClient().getAnalyst() != null) {
            return request.getClient().getAnalyst().getFirstName() + " " +
                    request.getClient().getAnalyst().getLastName();
        }
        return "Non assigné";
    }
}