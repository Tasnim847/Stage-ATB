package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.CopilotAnalysisRequestDTO;
import org.example.stage_atb.dto.response.CopilotAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.PremiumCopilotAnalysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CopilotAnalysisMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditRequest", source = "creditRequestId", qualifiedByName = "buildCreditRequest")
    @Mapping(target = "analyst", ignore = true)
    @Mapping(target = "analysisRequest", source = "analysisRequest")
    @Mapping(target = "analysisResponse", ignore = true)
    @Mapping(target = "riskLevel", ignore = true)
    @Mapping(target = "debtRatio", ignore = true)
    @Mapping(target = "incomeStability", ignore = true)
    @Mapping(target = "recommendedAction", ignore = true)
    @Mapping(target = "actionSuggestions", ignore = true)
    @Mapping(target = "aiInsights", ignore = true)
    @Mapping(target = "premiumEnabled", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    PremiumCopilotAnalysis toEntity(CopilotAnalysisRequestDTO requestDTO);

    @Mapping(target = "creditRequestId", expression = "java(analysis.getCreditRequest().getId())")
    @Mapping(target = "creditRequestNumber", expression = "java(analysis.getCreditRequest().getRequestNumber())")
    @Mapping(target = "analystId", expression = "java(analysis.getAnalyst().getId())")
    @Mapping(target = "analystName", expression = "java(analysis.getAnalyst().getFirstName() + \" \" + analysis.getAnalyst().getLastName())")
    CopilotAnalysisResponseDTO toResponseDTO(PremiumCopilotAnalysis analysis);

    void updateEntity(@MappingTarget PremiumCopilotAnalysis analysis, CopilotAnalysisRequestDTO requestDTO);

    @Named("buildCreditRequest")
    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }
}