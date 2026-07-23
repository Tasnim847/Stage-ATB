package org.example.stage_atb.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequestDTO {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "User ID is required")
    private String userId;  // AJOUTEZ CETTE LIGNE

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0", message = "Interest rate must be positive")
    private BigDecimal interestRate;

    private String loanPurpose;

    private String collateralType;

    private BigDecimal collateralValue;

    private String guarantorName;

    private String guarantorPhone;

    private LocalDate expectedDisbursementDate;

    private boolean submitImmediately;

}