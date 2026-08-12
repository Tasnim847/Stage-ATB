// dto/response/AnalystPerformanceDTO.java - WITH @Builder
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder  // ✅ AJOUTER @Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalystPerformanceDTO {
    private String analystId;
    private String analystName;
    private String analystEmail;
    private String department;
    private String position;

    private long totalProcessed;
    private long pendingRequests;
    private long totalApproved;
    private long totalRejected;
    private long totalCancelled;

    private double approvalRate;
    private double rejectionRate;
    private double averageProcessingTimeDays;
    private double averageDecisionTimeHours;

    private BigDecimal totalAmountApproved;
    private BigDecimal totalAmountRejected;
    private BigDecimal averageAmountPerRequest;

    private Map<String, Long> requestsByStatus;
    private List<MonthlyPerformanceDTO> monthlyPerformance;
    private List<RecentActivityDTO> recentActivities;

    private int rank;
    private String performanceLevel;

    private LocalDateTime lastActivityDate;
}