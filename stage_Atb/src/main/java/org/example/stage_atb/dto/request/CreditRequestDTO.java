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

// dto/request/CreditRequestDTO.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequestDTO {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Credit Type ID is required") // ✅ AJOUTER
    private String creditTypeId;

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

    // Champs spécifiques selon le type de crédit
    // Personnel
    private String salary;
    private String employer;

    // Auto
    private String vehicleBrand;
    private String vehicleModel;
    private BigDecimal vehiclePrice;
    private BigDecimal personalContribution;

    // Immobilier
    private String propertyType;
    private BigDecimal propertyValue;
    private String propertyAddress;

    // Professionnel
    private String companyName;
    private BigDecimal turnover;
    private String businessSector;

    private String collateralType;
    private BigDecimal collateralValue;
    private String guarantorName;
    private String guarantorPhone;

    private LocalDate expectedDisbursementDate;
    private boolean submitImmediately;
}