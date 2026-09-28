package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IDashboardService;
import org.example.stage_atb.dto.response.AnalystPerformanceDTO;
import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;
import org.example.stage_atb.dto.response.RecentActivityDTO;
import org.example.stage_atb.dto.response.TopAnalystDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.RiskLevel;
import org.example.stage_atb.Repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements IDashboardService {

    private final ClientRepository clientRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // ================================================================
    // STATISTIQUES GÉNÉRALES
    // ================================================================
    @Override
    public DashboardStatsResponseDTO getDashboardStats() {
        log.info("Generating real dashboard statistics");

        // ========== CARTES PRINCIPALES ==========
        long totalUsers  = userRepository.count();
        long activeUsers = userRepository.countActiveUsers();

        // ✅ Une seule requête groupée
        Map<String, Long> roleCounts = new HashMap<>();
        for (Object[] row : userRepository.countUsersGroupedByRole()) {
            if (row[0] != null && row[1] != null) {
                roleCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        long totalEmployees = roleCounts.getOrDefault("ANALYST", 0L)
                + roleCounts.getOrDefault("ADVISOR", 0L)
                + roleCounts.getOrDefault("MANAGER", 0L)
                + roleCounts.getOrDefault("ADMIN", 0L);

        long totalClients = roleCounts.getOrDefault("CLIENT", 0L);

        long totalCreditRequests = creditRequestRepository.countAll();
        long pendingRequests     = creditRequestRepository.countByStatus(CreditStatus.PENDING_ANALYSIS)
                + creditRequestRepository.countByStatus(CreditStatus.UNDER_REVIEW);
        long approvedRequests    = creditRequestRepository.countByStatus(CreditStatus.APPROVED);
        long rejectedRequests    = creditRequestRepository.countByStatus(CreditStatus.REJECTED);

        long fraudAlerts = fraudAlertRepository.countConfirmedAlerts();

        // ========== STATS FINANCIÈRES ==========
        BigDecimal totalAmountFinanced = creditRequestRepository.sumAmountByStatus(CreditStatus.APPROVED);
        if (totalAmountFinanced == null) totalAmountFinanced = BigDecimal.ZERO;

        long highRiskRequests = riskAnalysisRepository.findByOverallRiskIn(
                List.of(RiskLevel.HIGH, RiskLevel.VERY_HIGH, RiskLevel.CRITICAL)
        ).size();

        long totalNotifications = notificationRepository.countUnread();

        // ========== DISTRIBUTIONS ==========
        Map<String, Long> creditStatusDistribution = new HashMap<>();
        for (Object[] row : creditRequestRepository.countByStatusGrouped()) {
            if (row[0] != null && row[1] != null) {
                creditStatusDistribution.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        Map<String, BigDecimal> riskLevelDistribution = new HashMap<>();
        for (Object[] row : riskAnalysisRepository.countByRiskLevelGrouped()) {
            if (row[0] != null && row[1] != null) {
                riskLevelDistribution.put(
                        row[0].toString(),
                        BigDecimal.valueOf(((Number) row[1]).longValue())
                );
            }
        }

        // ========== TAUX D'APPROBATION ==========
        double approvalRate = totalCreditRequests > 0
                ? (double) approvedRequests / totalCreditRequests * 100
                : 0;

        // ========== ACTIVITÉS RÉCENTES / TOP ANALYSTES ==========
        List<RecentActivityDTO> recentActivities = buildRecentActivities(5);
        List<TopAnalystDTO> topAnalysts = buildTopAnalystsLegacy(3);

        return DashboardStatsResponseDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalEmployees(totalEmployees)
                .totalClients(totalClients)
                .totalCreditRequests(totalCreditRequests)
                .pendingRequests(pendingRequests)
                .approvedRequests(approvedRequests)
                .rejectedRequests(rejectedRequests)
                .fraudAlerts(fraudAlerts)
                .totalAmountFinanced(totalAmountFinanced)
                .highRiskRequests(highRiskRequests)
                .totalNotifications(totalNotifications)
                .pendingKYCVerifications(0L)
                .creditStatusDistribution(creditStatusDistribution)
                .riskLevelDistribution(riskLevelDistribution)
                .approvalRate(approvalRate)
                .recentActivities(recentActivities)
                .topAnalysts(topAnalysts)
                .build();
    }

    // ================================================================
    // TOP ANALYSTES (détaillé)
    // ================================================================
    @Override
    public List<AnalystPerformanceDTO> getTopAnalysts(int limit) {
        log.info("Fetching top {} analysts", limit);

        List<User> analysts = userRepository.findAllActiveAnalysts();
        if (analysts == null || analysts.isEmpty()) return Collections.emptyList();

        List<AnalystPerformanceDTO> performances = analysts.stream()
                .map(this::buildAnalystPerformance)
                .sorted(Comparator
                        .comparingLong(AnalystPerformanceDTO::getTotalProcessed)
                        .reversed()
                        .thenComparing(Comparator.comparingDouble(
                                AnalystPerformanceDTO::getApprovalRate).reversed())
                )
                .collect(Collectors.toList());

        for (int i = 0; i < performances.size(); i++) {
            AnalystPerformanceDTO p = performances.get(i);
            p.setRank(i + 1);
            p.setPerformanceLevel(computePerformanceLevel(p));
        }

        return performances.stream().limit(limit).collect(Collectors.toList());
    }

    // ================================================================
    // ACTIVITÉS RÉCENTES
    // ================================================================
    @Override
    public List<RecentActivityDTO> getRecentActivities(int limit) {
        log.info("Fetching {} recent activities", limit);
        return buildRecentActivities(limit);
    }

    // ================================================================
    // HELPERS PRIVÉS
    // ================================================================
    private List<RecentActivityDTO> buildRecentActivities(int limit) {
        List<CreditRequest> latest = creditRequestRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "updatedAt"))
        ).getContent();

        return latest.stream()
                .map(this::toRecentActivity)
                .collect(Collectors.toList());
    }

    private RecentActivityDTO toRecentActivity(CreditRequest cr) {
        return RecentActivityDTO.builder()
                .creditRequestId(cr.getId())
                .requestNumber(cr.getRequestNumber())
                .clientName(resolveClientName(cr))
                .action(getActionFromStatus(cr.getStatus()))
                .status(cr.getStatus() != null ? cr.getStatus().name() : "UNKNOWN")
                .actionDate(cr.getUpdatedAt() != null ? cr.getUpdatedAt() : cr.getCreatedAt())
                .amount(cr.getAmount())
                .build();
    }

    private String getActionFromStatus(CreditStatus status) {
        if (status == null) return "a mis à jour le dossier";
        switch (status) {
            case DRAFT:              return "a créé un brouillon";
            case PENDING_ANALYSIS:   return "a créé une demande de crédit";
            case UNDER_REVIEW:       return "attend une validation";
            case PENDING_DOCUMENTS:  return "attend des documents";
            case APPROVED:           return "a approuvé une demande";
            case REJECTED:           return "a rejeté une demande";
            case COMPLETED:          return "a finalisé la demande";
            case CANCELLED:          return "a annulé la demande";
            default:                 return "a mis à jour le dossier";
        }
    }

    private List<TopAnalystDTO> buildTopAnalystsLegacy(int limit) {
        List<User> analysts = userRepository.findAllActiveAnalysts();
        if (analysts == null || analysts.isEmpty()) return Collections.emptyList();

        return analysts.stream()
                .map(a -> {
                    long processed = creditRequestRepository.countProcessedByAnalyst(a.getId());
                    long approved  = creditRequestRepository.countApprovedByAnalyst(a.getId());
                    long rejected  = creditRequestRepository.countRejectedByAnalyst(a.getId());

                    double score = processed > 0 ? (double) approved / processed * 100 : 0;

                    return TopAnalystDTO.builder()
                            .analystId(a.getId())
                            .name(safeName(a))
                            .email(a.getEmail())
                            .requests(processed)
                            .approvedCount(approved)
                            .rejectedCount(rejected)
                            .avgScore(Math.round(score * 10.0) / 10.0)
                            .build();
                })
                .sorted(Comparator.comparing(TopAnalystDTO::getRequests).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private AnalystPerformanceDTO buildAnalystPerformance(User analyst) {
        String analystId = analyst.getId();

        long totalProcessed = creditRequestRepository.countProcessedByAnalyst(analystId);
        long totalApproved  = creditRequestRepository.countApprovedByAnalyst(analystId);
        long totalRejected  = creditRequestRepository.countRejectedByAnalyst(analystId);
        long totalCancelled = creditRequestRepository.countByAnalystAndStatus(
                analystId, CreditStatus.CANCELLED);

        long pendingRequests = creditRequestRepository.countByAnalystAndStatus(
                analystId, CreditStatus.PENDING_ANALYSIS)
                + creditRequestRepository.countByAnalystAndStatus(
                analystId, CreditStatus.UNDER_REVIEW);

        double approvalRate  = totalProcessed > 0 ? (double) totalApproved / totalProcessed * 100 : 0;
        double rejectionRate = totalProcessed > 0 ? (double) totalRejected / totalProcessed * 100 : 0;

        Double avgProcessingDays = creditRequestRepository.avgProcessingTimeDays(analystId);
        Double avgDecisionHours  = creditRequestRepository.avgDecisionTimeHours(analystId);

        BigDecimal totalAmountApproved = safeBigDecimal(
                creditRequestRepository.sumAmountByAnalystAndStatus(analystId, CreditStatus.APPROVED));
        BigDecimal totalAmountRejected = safeBigDecimal(
                creditRequestRepository.sumAmountByAnalystAndStatus(analystId, CreditStatus.REJECTED));

        BigDecimal avgAmountPerRequest = totalProcessed > 0
                ? totalAmountApproved.add(totalAmountRejected)
                .divide(BigDecimal.valueOf(totalProcessed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Long> requestsByStatus = new HashMap<>();
        for (Object[] row : creditRequestRepository.countByAnalystGroupedByStatus(analystId)) {
            if (row[0] != null && row[1] != null) {
                requestsByStatus.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        List<RecentActivityDTO> recentActivities = creditRequestRepository
                .findTop3ByAnalystIdOrderByUpdatedAtDesc(
                        analystId,
                        PageRequest.of(0, 3))
                .stream()
                .map(this::toRecentActivity)
                .collect(Collectors.toList());

        LocalDateTime lastActivity = creditRequestRepository.findLastActivityDateByAnalyst(analystId);

        return AnalystPerformanceDTO.builder()
                .analystId(analystId)
                .analystName(safeName(analyst))
                .analystEmail(analyst.getEmail())
                .totalProcessed(totalProcessed)
                .pendingRequests(pendingRequests)
                .totalApproved(totalApproved)
                .totalRejected(totalRejected)
                .totalCancelled(totalCancelled)
                .approvalRate(Math.round(approvalRate * 10.0) / 10.0)
                .rejectionRate(Math.round(rejectionRate * 10.0) / 10.0)
                .averageProcessingTimeDays(avgProcessingDays != null ? avgProcessingDays : 0)
                .averageDecisionTimeHours(avgDecisionHours != null ? avgDecisionHours : 0)
                .totalAmountApproved(totalAmountApproved)
                .totalAmountRejected(totalAmountRejected)
                .averageAmountPerRequest(avgAmountPerRequest)
                .requestsByStatus(requestsByStatus)
                .monthlyPerformance(Collections.emptyList())
                .recentActivities(recentActivities)
                .rank(0)
                .performanceLevel("STANDARD")
                .lastActivityDate(lastActivity)
                .build();
    }

    private String computePerformanceLevel(AnalystPerformanceDTO p) {
        long processed  = p.getTotalProcessed();
        double approval = p.getApprovalRate();

        if (processed >= 20 && approval >= 85) return "EXCELLENT";
        if (processed >= 10 && approval >= 70) return "TRÈS BON";
        if (processed >= 5  && approval >= 50) return "BON";
        if (processed > 0)                     return "STANDARD";
        return "DÉBUTANT";
    }

    private String safeName(User u) {
        if (u == null) return "Inconnu";
        String fn = u.getFirstName() != null ? u.getFirstName() : "";
        String ln = u.getLastName()  != null ? u.getLastName()  : "";
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? "Analyste" : full;
    }

    private String resolveClientName(CreditRequest cr) {
        if (cr == null || cr.getClient() == null) return "Client inconnu";
        String fn = cr.getClient().getFirstName() != null ? cr.getClient().getFirstName() : "";
        String ln = cr.getClient().getLastName()  != null ? cr.getClient().getLastName()  : "";
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? "Client inconnu" : full;
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    // ================================================================
    // À PERSONNALISER PLUS TARD
    // ================================================================
    @Override
    public DashboardStatsResponseDTO getDashboardStatsByAdvisor(String advisorId) {
        return getDashboardStats();
    }

    @Override
    public DashboardStatsResponseDTO getDashboardStatsByDateRange(String startDate, String endDate) {
        return getDashboardStats();
    }
}