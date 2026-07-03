package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;

import java.util.List;

public interface IFinancialAnalysisService {

    FinancialAnalysisResponseDTO createFinancialAnalysis(FinancialAnalysisRequestDTO financialAnalysisRequestDTO);

    FinancialAnalysisResponseDTO getFinancialAnalysisById(String id);

    FinancialAnalysisResponseDTO getFinancialAnalysisByCreditRequest(String creditRequestId);

    List<FinancialAnalysisResponseDTO> getFinancialAnalysesByAnalyst(String analystId);

    List<FinancialAnalysisResponseDTO> getAllFinancialAnalyses();

    FinancialAnalysisResponseDTO updateFinancialAnalysis(String id, FinancialAnalysisRequestDTO financialAnalysisRequestDTO);

    void deleteFinancialAnalysis(String id);

    FinancialAnalysisResponseDTO approveFinancialAnalysis(String id);

    FinancialAnalysisResponseDTO performAIAnalysis(String creditRequestId);

    List<FinancialAnalysisResponseDTO> getPendingAnalyses();

    List<FinancialAnalysisResponseDTO> getApprovedAnalyses();
}