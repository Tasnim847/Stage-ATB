package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.RiskAnalysisRequestDTO;
import org.example.stage_atb.dto.response.RiskAnalysisResponseDTO;
import org.example.stage_atb.enums.RiskLevel;

import java.util.List;

public interface IRiskAnalysisService {

    RiskAnalysisResponseDTO createRiskAnalysis(RiskAnalysisRequestDTO riskAnalysisRequestDTO);

    RiskAnalysisResponseDTO getRiskAnalysisById(String id);

    RiskAnalysisResponseDTO getRiskAnalysisByCreditRequest(String creditRequestId);

    List<RiskAnalysisResponseDTO> getRiskAnalysesByAnalyst(String analystId);

    List<RiskAnalysisResponseDTO> getRiskAnalysesByLevel(RiskLevel riskLevel);

    List<RiskAnalysisResponseDTO> getAllRiskAnalyses();

    RiskAnalysisResponseDTO updateRiskAnalysis(String id, RiskAnalysisRequestDTO riskAnalysisRequestDTO);

    void deleteRiskAnalysis(String id);

    RiskAnalysisResponseDTO performAIRiskAssessment(String creditRequestId);

    List<RiskAnalysisResponseDTO> getAnomaliesDetected();

    List<RiskAnalysisResponseDTO> getHighRiskAnalyses();

    List<Object[]> getRiskLevelDistribution();
}