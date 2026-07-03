package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.RiskAnalysisRequestDTO;
import org.example.stage_atb.dto.response.RiskAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.RiskAnalysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RiskAnalysisMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditRequest", expression = "java(buildCreditRequest(riskAnalysisRequestDTO.getCreditRequestId()))")
    @Mapping(target = "analyst", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    RiskAnalysis toEntity(RiskAnalysisRequestDTO riskAnalysisRequestDTO);

    @Mapping(target = "creditRequestId", expression = "java(riskAnalysis.getCreditRequest().getId())")
    @Mapping(target = "analystName", expression = "java(riskAnalysis.getAnalyst() != null ? riskAnalysis.getAnalyst().getFirstName() + \" \" + riskAnalysis.getAnalyst().getLastName() : null)")
    RiskAnalysisResponseDTO toResponseDTO(RiskAnalysis riskAnalysis);

    void updateEntity(@MappingTarget RiskAnalysis riskAnalysis, RiskAnalysisRequestDTO riskAnalysisRequestDTO);

    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }
}