package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponseDTO {

    // ===== CARTES PRINCIPALES =====
    private Long totalUsers;             // Utilisateurs totaux
    private Long activeUsers;            // Utilisateurs actifs
    private Long totalEmployees;         // Employés
    private Long totalClients;           // Clients
    private Long totalCreditRequests;    // Demandes de crédit
    private Long pendingRequests;        // En attente
    private Long approvedRequests;       // Approuvées
    private Long rejectedRequests;       // Refusées
    private Long fraudAlerts;            // Alertes fraude

    // ===== STATS FINANCIÈRES =====
    private BigDecimal totalAmountFinanced;
    private Long highRiskRequests;
    private Long pendingKYCVerifications;
    private Long totalNotifications;
    private Double approvalRate;

    // ===== DISTRIBUTIONS =====
    private Map<String, Long> creditStatusDistribution;
    private Map<String, BigDecimal> riskLevelDistribution;

    // ===== ACTIVITÉS RÉCENTES =====
    private List<RecentActivityDTO> recentActivities;

    // ===== TOP ANALYSTES =====
    private List<TopAnalystDTO> topAnalysts;
}