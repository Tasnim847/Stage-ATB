package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerKPIDTO {
    // KPI Généraux
    private long totalCreditRequests;
    private BigDecimal totalAmount;
    private BigDecimal averageAmount;

    // KPI par statut
    private long pendingCount;
    private BigDecimal pendingAmount;
    private long underReviewCount;
    private BigDecimal underReviewAmount;
    private long approvedCount;
    private BigDecimal approvedAmount;
    private long rejectedCount;
    private BigDecimal rejectedAmount;
    private long completedCount;
    private BigDecimal completedAmount;
    private long cancelledCount;
    private BigDecimal cancelledAmount;

    // KPI de performance
    private double approvalRate;
    private double rejectionRate;
    private double averageProcessingDays;
    private double averageDecisionHours;

    // KPI de risque
    private long highRiskCount;
    private BigDecimal highRiskAmount;
    private BigDecimal averageRiskScore;

    // KPI des analystes
    private long totalAnalysts;
    private long activeAnalysts;
    private double averageWorkload;

    // KPI de validation manager
    private long pendingValidationCount;
    private long validatedCount;
    private double managerApprovalRate;

    // KPI mensuels
    private List<MonthlyKPIDTO> monthlyKPIs;

    // KPI par type de crédit
    private List<CreditTypeKPIDTO> creditTypeDistribution;

    // KPI par analyste
    private List<AnalystKPIDTO> analystKPIs;

    // Dernières activités
    private List<RecentActivityDTO> recentActivities;
}

