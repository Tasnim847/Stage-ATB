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
public class MonthlyKPIDTO {
    private String month;
    private int year;
    private long requestsCount;
    private long approvedCount;
    private long rejectedCount;
    private BigDecimal totalAmount;
    private double approvalRate;
}