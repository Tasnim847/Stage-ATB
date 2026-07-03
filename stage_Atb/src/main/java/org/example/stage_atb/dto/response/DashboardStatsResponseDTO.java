package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponseDTO {

    private Long totalClients;
    private Long totalCreditRequests;
    private Long pendingRequests;
    private Long approvedRequests;
    private Long rejectedRequests;
    private BigDecimal totalAmountFinanced;
    private Long highRiskRequests;
    private Long fraudAlerts;
    private Long pendingKYCVerifications;
    private Long totalNotifications;
    private Map<String, Long> creditStatusDistribution;
    private Map<String, BigDecimal> riskLevelDistribution;
    private Double approvalRate;
}