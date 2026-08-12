// dto/response/MonthlyPerformanceDTO.java - WITH @Builder
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder  // ✅ AJOUTER @Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyPerformanceDTO {
    private String month;
    private int year;
    private long processedCount;
    private long approvedCount;
    private long rejectedCount;
    private double approvalRate;
    private BigDecimal totalAmount;
    private double averageProcessingTime;
}