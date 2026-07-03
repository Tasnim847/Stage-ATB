package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FinancialAnalysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FinancialAnalysisMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditRequest", expression = "java(buildCreditRequest(financialAnalysisRequestDTO.getCreditRequestId()))")
    @Mapping(target = "analyst", ignore = true)
    @Mapping(target = "approvedByAnalyst", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    FinancialAnalysis toEntity(FinancialAnalysisRequestDTO financialAnalysisRequestDTO);

    @Mapping(target = "creditRequestId", expression = "java(financialAnalysis.getCreditRequest().getId())")
    @Mapping(target = "analystName", expression = "java(financialAnalysis.getAnalyst() != null ? financialAnalysis.getAnalyst().getFirstName() + \" \" + financialAnalysis.getAnalyst().getLastName() : null)")
    FinancialAnalysisResponseDTO toResponseDTO(FinancialAnalysis financialAnalysis);

    void updateEntity(@MappingTarget FinancialAnalysis financialAnalysis, FinancialAnalysisRequestDTO financialAnalysisRequestDTO);

    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }
}