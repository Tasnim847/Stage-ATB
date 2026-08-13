// Service/impl/KPIServiceImpl.java - CORRIGÉ AVEC @Transactional
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.CreditTypeRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IKPIService;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional // ✅ AJOUTER @Transactional sur toute la classe
public class KPIServiceImpl implements IKPIService {

    private final CreditRequestRepository creditRequestRepository;
    private final CreditTypeRepository creditTypeRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    private static final BigDecimal HIGH_RISK_THRESHOLD = BigDecimal.valueOf(70);

    @Override
    public ManagerKPIDTO getManagerKPIs() {
        log.info("📊 Récupération des KPIs pour le manager");

        List<CreditRequest> allRequests = creditRequestRepository.findAll();
        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        return ManagerKPIDTO.builder()
                // Généraux
                .totalCreditRequests(allRequests.size())
                .totalAmount(calculateTotalAmount(allRequests))
                .averageAmount(calculateAverageAmount(allRequests))

                // Par statut
                .pendingCount(countByStatus(allRequests, CreditStatus.PENDING_ANALYSIS))
                .pendingAmount(sumAmountByStatus(allRequests, CreditStatus.PENDING_ANALYSIS))
                .underReviewCount(countByStatus(allRequests, CreditStatus.UNDER_REVIEW))
                .underReviewAmount(sumAmountByStatus(allRequests, CreditStatus.UNDER_REVIEW))
                .approvedCount(countByStatus(allRequests, CreditStatus.APPROVED))
                .approvedAmount(sumAmountByStatus(allRequests, CreditStatus.APPROVED))
                .rejectedCount(countByStatus(allRequests, CreditStatus.REJECTED))
                .rejectedAmount(sumAmountByStatus(allRequests, CreditStatus.REJECTED))
                .completedCount(countByStatus(allRequests, CreditStatus.COMPLETED))
                .completedAmount(sumAmountByStatus(allRequests, CreditStatus.COMPLETED))
                .cancelledCount(countByStatus(allRequests, CreditStatus.CANCELLED))
                .cancelledAmount(sumAmountByStatus(allRequests, CreditStatus.CANCELLED))

                // Performance
                .approvalRate(calculateApprovalRate(allRequests))
                .rejectionRate(calculateRejectionRate(allRequests))
                .averageProcessingDays(calculateAverageProcessingDays(allRequests))
                .averageDecisionHours(calculateAverageDecisionHours(allRequests))

                // Risque
                .highRiskCount(countHighRiskRequests(allRequests))
                .highRiskAmount(sumHighRiskAmount(allRequests))
                .averageRiskScore(calculateAverageRiskScore(allRequests))

                // Analystes
                .totalAnalysts(analysts.size())
                .activeAnalysts(countActiveAnalysts(analysts))
                .averageWorkload(calculateAverageWorkload(analysts))

                // Validation manager
                .pendingValidationCount(countPendingManagerValidation(allRequests))
                .validatedCount(countManagerValidated(allRequests))
                .managerApprovalRate(calculateManagerApprovalRate(allRequests))

                // KPIs mensuels
                .monthlyKPIs(calculateMonthlyKPIs(allRequests))

                // Distribution par type
                .creditTypeDistribution(calculateCreditTypeDistribution(allRequests))

                // KPIs analystes
                .analystKPIs(calculateAnalystKPIs(allRequests, analysts))

                // Dernières activités
                .recentActivities(getRecentActivities(allRequests))

                .build();
    }

    @Override
    public ManagerKPIDTO getKPIsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Récupération des KPIs entre {} et {}", startDate, endDate);

        List<CreditRequest> requests = creditRequestRepository.findByDateRange(startDate, endDate);

        // Utiliser les mêmes méthodes avec la liste filtrée
        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        return ManagerKPIDTO.builder()
                .totalCreditRequests(requests.size())
                .totalAmount(calculateTotalAmount(requests))
                .averageAmount(calculateAverageAmount(requests))
                .pendingCount(countByStatus(requests, CreditStatus.PENDING_ANALYSIS))
                .pendingAmount(sumAmountByStatus(requests, CreditStatus.PENDING_ANALYSIS))
                .underReviewCount(countByStatus(requests, CreditStatus.UNDER_REVIEW))
                .underReviewAmount(sumAmountByStatus(requests, CreditStatus.UNDER_REVIEW))
                .approvedCount(countByStatus(requests, CreditStatus.APPROVED))
                .approvedAmount(sumAmountByStatus(requests, CreditStatus.APPROVED))
                .rejectedCount(countByStatus(requests, CreditStatus.REJECTED))
                .rejectedAmount(sumAmountByStatus(requests, CreditStatus.REJECTED))
                .completedCount(countByStatus(requests, CreditStatus.COMPLETED))
                .completedAmount(sumAmountByStatus(requests, CreditStatus.COMPLETED))
                .cancelledCount(countByStatus(requests, CreditStatus.CANCELLED))
                .cancelledAmount(sumAmountByStatus(requests, CreditStatus.CANCELLED))
                .approvalRate(calculateApprovalRate(requests))
                .rejectionRate(calculateRejectionRate(requests))
                .averageProcessingDays(calculateAverageProcessingDays(requests))
                .averageDecisionHours(calculateAverageDecisionHours(requests))
                .highRiskCount(countHighRiskRequests(requests))
                .highRiskAmount(sumHighRiskAmount(requests))
                .averageRiskScore(calculateAverageRiskScore(requests))
                .totalAnalysts(analysts.size())
                .activeAnalysts(countActiveAnalysts(analysts))
                .averageWorkload(calculateAverageWorkload(analysts))
                .pendingValidationCount(countPendingManagerValidation(requests))
                .validatedCount(countManagerValidated(requests))
                .managerApprovalRate(calculateManagerApprovalRate(requests))
                .monthlyKPIs(calculateMonthlyKPIs(requests))
                .creditTypeDistribution(calculateCreditTypeDistribution(requests))
                .analystKPIs(calculateAnalystKPIs(requests, analysts))
                .recentActivities(getRecentActivities(requests))
                .build();
    }

    @Override
    public List<AnalystKPIDTO> getAnalystPerformanceKPIs() {
        log.info("📊 Récupération des KPIs de performance des analystes");

        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);
        List<CreditRequest> allRequests = creditRequestRepository.findAll();

        return analysts.stream()
                .map(analyst -> buildAnalystKPI(analyst, allRequests))
                .collect(Collectors.toList());
    }

    @Override
    public Object getManagerValidationKPIs() {
        log.info("📊 Récupération des KPIs de validation manager");

        Map<String, Object> result = new HashMap<>();
        List<CreditRequest> allRequests = creditRequestRepository.findAll();

        result.put("pendingValidationCount", countPendingManagerValidation(allRequests));
        result.put("validatedCount", countManagerValidated(allRequests));
        result.put("managerApprovalRate", calculateManagerApprovalRate(allRequests));

        return result;
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private BigDecimal calculateTotalAmount(List<CreditRequest> requests) {
        return requests.stream()
                .map(CreditRequest::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageAmount(List<CreditRequest> requests) {
        if (requests.isEmpty()) return BigDecimal.ZERO;
        return calculateTotalAmount(requests)
                .divide(BigDecimal.valueOf(requests.size()), 2, RoundingMode.HALF_UP);
    }

    private long countByStatus(List<CreditRequest> requests, CreditStatus status) {
        return requests.stream()
                .filter(r -> r.getStatus() == status)
                .count();
    }

    private BigDecimal sumAmountByStatus(List<CreditRequest> requests, CreditStatus status) {
        return requests.stream()
                .filter(r -> r.getStatus() == status)
                .map(CreditRequest::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double calculateApprovalRate(List<CreditRequest> requests) {
        long total = requests.size();
        if (total == 0) return 0;
        long approved = countByStatus(requests, CreditStatus.APPROVED);
        return (double) approved / total * 100;
    }

    private double calculateRejectionRate(List<CreditRequest> requests) {
        long total = requests.size();
        if (total == 0) return 0;
        long rejected = countByStatus(requests, CreditStatus.REJECTED);
        return (double) rejected / total * 100;
    }

    private double calculateAverageProcessingDays(List<CreditRequest> requests) {
        List<CreditRequest> processed = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED ||
                        r.getStatus() == CreditStatus.REJECTED)
                .filter(r -> r.getCreatedAt() != null && r.getUpdatedAt() != null)
                .collect(Collectors.toList());

        if (processed.isEmpty()) return 0;

        double totalDays = processed.stream()
                .mapToDouble(r -> ChronoUnit.DAYS.between(r.getCreatedAt(), r.getUpdatedAt()))
                .sum();

        return totalDays / processed.size();
    }

    private double calculateAverageDecisionHours(List<CreditRequest> requests) {
        List<CreditRequest> decided = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED ||
                        r.getStatus() == CreditStatus.REJECTED)
                .filter(r -> r.getCreatedAt() != null && r.getUpdatedAt() != null)
                .collect(Collectors.toList());

        if (decided.isEmpty()) return 0;

        double totalHours = decided.stream()
                .mapToDouble(r -> ChronoUnit.HOURS.between(r.getCreatedAt(), r.getUpdatedAt()))
                .sum();

        return totalHours / decided.size();
    }

    private long countHighRiskRequests(List<CreditRequest> requests) {
        return requests.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null &&
                        r.getRiskAnalysis().getRiskScore().compareTo(HIGH_RISK_THRESHOLD) >= 0)
                .count();
    }

    private BigDecimal sumHighRiskAmount(List<CreditRequest> requests) {
        return requests.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null &&
                        r.getRiskAnalysis().getRiskScore().compareTo(HIGH_RISK_THRESHOLD) >= 0)
                .map(CreditRequest::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageRiskScore(List<CreditRequest> requests) {
        List<CreditRequest> withScore = requests.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null)
                .collect(Collectors.toList());

        if (withScore.isEmpty()) return BigDecimal.ZERO;

        return withScore.stream()
                .map(r -> r.getRiskAnalysis().getRiskScore())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(withScore.size()), 2, RoundingMode.HALF_UP);
    }

    private long countActiveAnalysts(List<User> analysts) {
        return analysts.stream()
                .filter(User::isActive)
                .count();
    }

    private double calculateAverageWorkload(List<User> analysts) {
        if (analysts.isEmpty()) return 0;

        long totalWorkload = analysts.stream()
                .mapToLong(a -> creditRequestRepository.countByAnalystIdAndStatuses(
                        a.getId(),
                        Arrays.asList(CreditStatus.PENDING_ANALYSIS, CreditStatus.UNDER_REVIEW)
                ))
                .sum();

        return (double) totalWorkload / analysts.size();
    }

    private long countPendingManagerValidation(List<CreditRequest> requests) {
        return requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.UNDER_REVIEW &&
                        r.isManagerValidationRequired())
                .count();
    }

    private long countManagerValidated(List<CreditRequest> requests) {
        return requests.stream()
                .filter(r -> r.isManagerValidationRequired() &&
                        (r.getStatus() == CreditStatus.APPROVED ||
                                r.getStatus() == CreditStatus.REJECTED))
                .count();
    }

    private double calculateManagerApprovalRate(List<CreditRequest> requests) {
        long validated = countManagerValidated(requests);
        if (validated == 0) return 0;

        long approved = requests.stream()
                .filter(r -> r.isManagerValidationRequired() &&
                        r.getStatus() == CreditStatus.APPROVED)
                .count();

        return (double) approved / validated * 100;
    }

    private List<MonthlyKPIDTO> calculateMonthlyKPIs(List<CreditRequest> requests) {
        Map<String, List<CreditRequest>> byMonth = requests.stream()
                .filter(r -> r.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().getYear() + "-" +
                                String.format("%02d", r.getCreatedAt().getMonthValue())
                ));

        return byMonth.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    List<CreditRequest> monthRequests = entry.getValue();

                    long approved = monthRequests.stream()
                            .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                            .count();
                    long rejected = monthRequests.stream()
                            .filter(r -> r.getStatus() == CreditStatus.REJECTED)
                            .count();

                    return MonthlyKPIDTO.builder()
                            .month(getMonthName(month))
                            .year(year)
                            .requestsCount(monthRequests.size())
                            .approvedCount(approved)
                            .rejectedCount(rejected)
                            .totalAmount(calculateTotalAmount(monthRequests))
                            .approvalRate(monthRequests.isEmpty() ? 0 :
                                    (double) approved / monthRequests.size() * 100)
                            .build();
                })
                .sorted((a, b) -> {
                    if (a.getYear() != b.getYear()) return b.getYear() - a.getYear();
                    return b.getMonth().compareTo(a.getMonth());
                })
                .limit(12)
                .collect(Collectors.toList());
    }

    private List<CreditTypeKPIDTO> calculateCreditTypeDistribution(List<CreditRequest> requests) {
        Map<String, List<CreditRequest>> byType = requests.stream()
                .filter(r -> r.getCreditType() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getCreditType().getId()
                ));

        return byType.entrySet().stream()
                .map(entry -> {
                    String typeId = entry.getKey();
                    List<CreditRequest> typeRequests = entry.getValue();
                    // ✅ Récupérer le nom du type de crédit en évitant le proxy
                    String typeName = typeRequests.isEmpty() ? "Non défini" :
                            typeRequests.get(0).getCreditType().getName();

                    return CreditTypeKPIDTO.builder()
                            .creditTypeId(typeId)
                            .creditTypeName(typeName)
                            .count(typeRequests.size())
                            .totalAmount(calculateTotalAmount(typeRequests))
                            .averageAmount(calculateAverageAmount(typeRequests))
                            .approvalRate(typeRequests.isEmpty() ? 0 :
                                    (double) typeRequests.stream()
                                            .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                                            .count() / typeRequests.size() * 100)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<AnalystKPIDTO> calculateAnalystKPIs(List<CreditRequest> requests, List<User> analysts) {
        return analysts.stream()
                .map(analyst -> buildAnalystKPI(analyst, requests))
                .collect(Collectors.toList());
    }

    private AnalystKPIDTO buildAnalystKPI(User analyst, List<CreditRequest> allRequests) {
        List<CreditRequest> analystRequests = allRequests.stream()
                .filter(r -> r.getClient() != null &&
                        r.getClient().getAnalyst() != null &&
                        r.getClient().getAnalyst().getId().equals(analyst.getId()))
                .collect(Collectors.toList());

        long processed = analystRequests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED ||
                        r.getStatus() == CreditStatus.REJECTED)
                .count();

        long approved = analystRequests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                .count();

        long rejected = analystRequests.stream()
                .filter(r -> r.getStatus() == CreditStatus.REJECTED)
                .count();

        return AnalystKPIDTO.builder()
                .analystId(analyst.getId())
                .analystName(analyst.getFirstName() + " " + analyst.getLastName())
                .processedCount(processed)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .approvalRate(processed == 0 ? 0 : (double) approved / processed * 100)
                .averageProcessingTime(calculateAverageProcessingDays(analystRequests))
                .totalAmount(analystRequests.stream()
                        .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                        .map(CreditRequest::getAmount)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .build();
    }

    private List<RecentActivityDTO> getRecentActivities(List<CreditRequest> requests) {
        return requests.stream()
                .filter(r -> r.getUpdatedAt() != null && r.getClient() != null)
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getUpdatedAt() != null ? a.getUpdatedAt() : a.getCreatedAt();
                    LocalDateTime dateB = b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt();
                    return dateB.compareTo(dateA);
                })
                .limit(10)
                .map(r -> {
                    String clientName = "Client inconnu";
                    if (r.getClient() != null) {
                        clientName = (r.getClient().getFirstName() != null ? r.getClient().getFirstName() : "") +
                                " " +
                                (r.getClient().getLastName() != null ? r.getClient().getLastName() : "");
                        clientName = clientName.trim();
                    }

                    return RecentActivityDTO.builder()
                            .creditRequestId(r.getId())
                            .requestNumber(r.getRequestNumber() != null ? r.getRequestNumber() : "N/A")
                            .clientName(clientName)
                            .action(getActionLabel(r.getStatus()))
                            .status(r.getStatus() != null ? r.getStatus().toString() : "UNKNOWN")
                            .actionDate(r.getUpdatedAt() != null ? r.getUpdatedAt() : r.getCreatedAt())
                            .amount(r.getAmount() != null ? r.getAmount() : BigDecimal.ZERO)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String getActionLabel(CreditStatus status) {
        if (status == null) return "En traitement";
        switch (status) {
            case APPROVED: return "Approuvé";
            case REJECTED: return "Rejeté";
            case PENDING_ANALYSIS: return "En attente d'analyse";
            case UNDER_REVIEW: return "En révision";
            case COMPLETED: return "Complété";
            case CANCELLED: return "Annulé";
            default: return "En traitement";
        }
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
                "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"};
        return months[month - 1];
    }
}