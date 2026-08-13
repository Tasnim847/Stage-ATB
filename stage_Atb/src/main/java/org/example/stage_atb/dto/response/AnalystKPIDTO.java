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
public class AnalystKPIDTO {
    private String analystId;
    private String analystName;
    private long processedCount;
    private long approvedCount;
    private long rejectedCount;
    private double approvalRate;
    private double averageProcessingTime;
    private BigDecimal totalAmount;
}
