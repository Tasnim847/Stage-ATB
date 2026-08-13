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
public class CreditTypeKPIDTO {
    private String creditTypeId;
    private String creditTypeName;
    private long count;
    private BigDecimal totalAmount;
    private BigDecimal averageAmount;
    private double approvalRate;
}