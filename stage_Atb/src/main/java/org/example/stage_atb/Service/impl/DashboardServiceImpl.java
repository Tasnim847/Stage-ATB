package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IDashboardService;
import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.FraudAlertRepository;
import org.example.stage_atb.Repositories.RiskAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements IDashboardService {

    private final ClientRepository clientRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final FraudAlertRepository fraudAlertRepository;

    @Override
    public DashboardStatsResponseDTO getDashboardStats() {
        log.info("Generating dashboard statistics");

        long totalClients = clientRepository.countActiveClients();
        long totalCreditRequests = creditRequestRepository.count();
        long pendingRequests = creditRequestRepository.countByStatusSince(CreditStatus.PENDING_ANALYSIS, LocalDateTime.now().minusDays(30));
        long approvedRequests = creditRequestRepository.countByStatusSince(CreditStatus.APPROVED, LocalDateTime.now().minusDays(30));
        long rejectedRequests = creditRequestRepository.countByStatusSince(CreditStatus.REJECTED, LocalDateTime.now().minusDays(30));

        BigDecimal totalAmountFinanced = creditRequestRepository.sumAmountByStatus(CreditStatus.APPROVED);
        if (totalAmountFinanced == null) totalAmountFinanced = BigDecimal.ZERO;

        long highRiskRequests = riskAnalysisRepository.findByOverallRiskIn(
                List.of(org.example.stage_atb.enums.RiskLevel.HIGH,
                        org.example.stage_atb.enums.RiskLevel.VERY_HIGH,
                        org.example.stage_atb.enums.RiskLevel.CRITICAL)).size();

        long fraudAlerts = fraudAlertRepository.countConfirmedAlerts();
        long pendingKYC = 0; // À implémenter avec KYC repository
        long totalNotifications = 0; // À implémenter avec Notification repository

        // Distribution des statuts
        Map<String, Long> statusDistribution = new HashMap<>();
        List<Object[]> statusCounts = creditRequestRepository.countByStatusGrouped();
        for (Object[] row : statusCounts) {
            statusDistribution.put(row[0].toString(), (Long) row[1]);
        }

        // Distribution des niveaux de risque - CORRECTION ICI
        Map<String, BigDecimal> riskDistribution = new HashMap<>();
        List<Object[]> riskCounts = riskAnalysisRepository.countByRiskLevelGrouped();
        for (Object[] row : riskCounts) {
            // Convertir le count en BigDecimal
            Object count = row[1];
            if (count instanceof Long) {
                riskDistribution.put(row[0].toString(), BigDecimal.valueOf((Long) count));
            } else if (count instanceof Integer) {
                riskDistribution.put(row[0].toString(), BigDecimal.valueOf((Integer) count));
            } else if (count instanceof BigDecimal) {
                riskDistribution.put(row[0].toString(), (BigDecimal) count);
            } else {
                riskDistribution.put(row[0].toString(), BigDecimal.valueOf(Double.parseDouble(count.toString())));
            }
        }

        // Taux d'approbation
        double approvalRate = totalCreditRequests > 0 ?
                (double) approvedRequests / totalCreditRequests * 100 : 0;

        return DashboardStatsResponseDTO.builder()
                .totalClients(totalClients)
                .totalCreditRequests(totalCreditRequests)
                .pendingRequests(pendingRequests)
                .approvedRequests(approvedRequests)
                .rejectedRequests(rejectedRequests)
                .totalAmountFinanced(totalAmountFinanced)
                .highRiskRequests(highRiskRequests)
                .fraudAlerts(fraudAlerts)
                .pendingKYCVerifications(pendingKYC)
                .totalNotifications(totalNotifications)
                .creditStatusDistribution(statusDistribution)
                .riskLevelDistribution(riskDistribution)
                .approvalRate(approvalRate) // double -> BigDecimal sera converti automatiquement dans le builder
                .build();
    }

    @Override
    public DashboardStatsResponseDTO getDashboardStatsByAdvisor(String advisorId) {
        // Implémenter la logique pour un conseiller spécifique
        log.info("Generating dashboard statistics for advisor: {}", advisorId);
        return getDashboardStats();
    }

    @Override
    public DashboardStatsResponseDTO getDashboardStatsByDateRange(String startDate, String endDate) {
        // Implémenter la logique pour une plage de dates
        log.info("Generating dashboard statistics from {} to {}", startDate, endDate);
        return getDashboardStats();
    }
}