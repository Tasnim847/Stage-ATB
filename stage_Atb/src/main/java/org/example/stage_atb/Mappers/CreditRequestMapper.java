package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface CreditRequestMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "requestNumber", expression = "java(generateRequestNumber())")
    @Mapping(target = "client", expression = "java(buildClient(creditRequestDTO.getClientId()))")
    @Mapping(target = "user", expression = "java(buildUser(creditRequestDTO.getUserId()))")
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "monthlyPayment", expression = "java(calculateMonthlyPayment(creditRequestDTO))")
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "financialAnalysis", ignore = true)
    @Mapping(target = "riskAnalysis", ignore = true)
    @Mapping(target = "creditScore", ignore = true)
    @Mapping(target = "decisionRecommendation", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "approvalDate", ignore = true)
    CreditRequest toEntity(CreditRequestDTO creditRequestDTO);

    @Mapping(target = "clientId", expression = "java(creditRequest.getClient().getId())")
    @Mapping(target = "clientName", expression = "java(creditRequest.getClient().getFirstName() + \" \" + creditRequest.getClient().getLastName())")
    @Mapping(target = "clientEmail", expression = "java(creditRequest.getClient().getEmail())")
    @Mapping(target = "analystName", expression = "java(getAnalystName(creditRequest))")
    @Mapping(target = "riskLevel", expression = "java(getRiskLevel(creditRequest))")
    @Mapping(target = "riskScore", expression = "java(getRiskScore(creditRequest))")
    @Mapping(target = "decisionRecommendation", expression = "java(getDecisionRecommendation(creditRequest))")
    @Mapping(target = "financialHealthScore", expression = "java(getFinancialHealthScore(creditRequest))")
    @Mapping(target = "debtRatio", expression = "java(getDebtRatio(creditRequest))")
    CreditResponseDTO toResponseDTO(CreditRequest creditRequest);

    void updateEntity(@MappingTarget CreditRequest creditRequest, CreditRequestDTO creditRequestDTO);

    // Helper methods
    default String generateRequestNumber() {
        return "CR-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }

    default Client buildClient(String clientId) {
        if (clientId == null) return null;
        Client client = new Client();
        client.setId(clientId);
        return client;
    }

    default User buildUser(String userId) {
        if (userId == null) return null;
        User user = new User();
        user.setId(userId);
        return user;
    }

    default BigDecimal calculateMonthlyPayment(CreditRequestDTO dto) {
        if (dto.getAmount() == null || dto.getInterestRate() == null || dto.getDurationMonths() == null) {
            return BigDecimal.ZERO;
        }
        // Simple amortization calculation
        BigDecimal monthlyRate = dto.getInterestRate().divide(new BigDecimal("1200"));
        BigDecimal power = BigDecimal.ONE;
        for (int i = 0; i < dto.getDurationMonths(); i++) {
            power = power.multiply(monthlyRate.add(BigDecimal.ONE));
        }
        BigDecimal numerator = dto.getAmount().multiply(monthlyRate).multiply(power);
        BigDecimal denominator = power.subtract(BigDecimal.ONE);
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return dto.getAmount().divide(new BigDecimal(dto.getDurationMonths()), 2);
        }
        return numerator.divide(denominator, 2);
    }

    default String getAnalystName(CreditRequest creditRequest) {
        if (creditRequest.getRiskAnalysis() != null && creditRequest.getRiskAnalysis().getAnalyst() != null) {
            return creditRequest.getRiskAnalysis().getAnalyst().getFirstName() + " " +
                    creditRequest.getRiskAnalysis().getAnalyst().getLastName();
        }
        return null;
    }

    default String getRiskLevel(CreditRequest creditRequest) {
        if (creditRequest.getRiskAnalysis() != null) {
            return creditRequest.getRiskAnalysis().getOverallRisk().toString();
        }
        return null;
    }

    default BigDecimal getRiskScore(CreditRequest creditRequest) {
        if (creditRequest.getRiskAnalysis() != null) {
            return creditRequest.getRiskAnalysis().getRiskScore();
        }
        return null;
    }

    default String getDecisionRecommendation(CreditRequest creditRequest) {
        if (creditRequest.getDecisionRecommendation() != null) {
            return creditRequest.getDecisionRecommendation().getRecommendedAction();
        }
        return null;
    }

    default String getFinancialHealthScore(CreditRequest creditRequest) {
        if (creditRequest.getFinancialAnalysis() != null) {
            return creditRequest.getFinancialAnalysis().getFinancialHealthScore();
        }
        return null;
    }

    default BigDecimal getDebtRatio(CreditRequest creditRequest) {
        if (creditRequest.getFinancialAnalysis() != null) {
            return creditRequest.getFinancialAnalysis().getDebtRatio();
        }
        return null;
    }
}