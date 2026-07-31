// FinancialAnalysisMapper.java - CORRIGÉ
package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FinancialAnalysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.context.annotation.Primary;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
@Primary  // ✅ AJOUTER CETTE ANNOTATION
public interface FinancialAnalysisMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditRequest", source = "creditRequestId", qualifiedByName = "buildCreditRequest")
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "analyst", ignore = true)
    @Mapping(target = "approvedByAnalyst", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    FinancialAnalysis toEntity(FinancialAnalysisRequestDTO requestDTO);

    @Mapping(target = "creditRequestId", expression = "java(financialAnalysis.getCreditRequest() != null ? financialAnalysis.getCreditRequest().getId() : null)")
    @Mapping(target = "clientId", expression = "java(financialAnalysis.getClient() != null ? financialAnalysis.getClient().getId() : null)")
    @Mapping(target = "clientName", expression = "java(getClientName(financialAnalysis))")
    @Mapping(target = "analystName", expression = "java(financialAnalysis.getAnalyst() != null ? financialAnalysis.getAnalyst().getFirstName() + \" \" + financialAnalysis.getAnalyst().getLastName() : null)")
    @Mapping(target = "debtRatioStatus", expression = "java(getDebtRatioStatus(financialAnalysis.getDebtRatio()))")
    @Mapping(target = "repaymentCapacityStatus", expression = "java(getRepaymentCapacityStatus(financialAnalysis.getRepaymentCapacity()))")
    @Mapping(target = "residualIncomeStatus", expression = "java(getResidualIncomeStatus(financialAnalysis.getResidualIncome()))")
    @Mapping(target = "monthlyPaymentRatioStatus", expression = "java(getMonthlyPaymentRatioStatus(financialAnalysis.getMonthlyPaymentRatio()))")
    @Mapping(target = "ltiStatus", expression = "java(getLtiStatus(financialAnalysis.getLti()))")
    @Mapping(target = "ltvStatus", expression = "java(getLtvStatus(financialAnalysis.getLtv()))")
    @Mapping(target = "currentRatioStatus", expression = "java(getCurrentRatioStatus(financialAnalysis.getCurrentRatio()))")
    @Mapping(target = "solvencyRatioStatus", expression = "java(getSolvencyRatioStatus(financialAnalysis.getSolvencyRatio()))")
    @Mapping(target = "dscrStatus", expression = "java(getDscrStatus(financialAnalysis.getDscr()))")
    FinancialAnalysisResponseDTO toResponseDTO(FinancialAnalysis financialAnalysis);

    void updateEntity(@MappingTarget FinancialAnalysis financialAnalysis, FinancialAnalysisRequestDTO requestDTO);

    @Named("buildCreditRequest")
    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }

    default String getClientName(FinancialAnalysis analysis) {
        if (analysis.getClient() != null) {
            return analysis.getClient().getFirstName() + " " + analysis.getClient().getLastName();
        }
        return null;
    }

    // Méthodes de statut pour les ratios
    default String getDebtRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(30)) <= 0) return "FAIBLE";
        if (value.compareTo(BigDecimal.valueOf(33)) <= 0) return "ACCEPTABLE";
        if (value.compareTo(BigDecimal.valueOf(40)) <= 0) return "ELEVE";
        return "CRITIQUE";
    }

    default String getRepaymentCapacityStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1500)) >= 0) return "TRES_BONNE";
        if (value.compareTo(BigDecimal.valueOf(1000)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(500)) >= 0) return "MOYENNE";
        return "FAIBLE";
    }

    default String getResidualIncomeStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1500)) >= 0) return "SUFFISANT";
        if (value.compareTo(BigDecimal.valueOf(500)) >= 0) return "ACCEPTABLE";
        return "INSUFFISANT";
    }

    default String getMonthlyPaymentRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(30)) <= 0) return "BON";
        if (value.compareTo(BigDecimal.valueOf(40)) <= 0) return "MOYEN";
        return "ELEVE";
    }

    default String getLtiStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(300)) <= 0) return "BON";
        if (value.compareTo(BigDecimal.valueOf(500)) <= 0) return "ACCEPTABLE";
        return "ELEVE";
    }

    default String getLtvStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(70)) <= 0) return "FAIBLE_RISQUE";
        if (value.compareTo(BigDecimal.valueOf(80)) <= 0) return "MODERE";
        if (value.compareTo(BigDecimal.valueOf(90)) <= 0) return "ELEVE";
        return "TRES_ELEVE";
    }

    default String getCurrentRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1.5)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(1.0)) >= 0) return "ACCEPTABLE";
        return "RISQUE";
    }

    default String getSolvencyRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(40)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(25)) >= 0) return "ACCEPTABLE";
        return "FAIBLE";
    }

    default String getDscrStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1.5)) >= 0) return "TRES_BON";
        if (value.compareTo(BigDecimal.valueOf(1.2)) >= 0) return "ACCEPTABLE";
        if (value.compareTo(BigDecimal.valueOf(1.0)) >= 0) return "FRAGILE";
        return "INSUFFISANT";
    }
}