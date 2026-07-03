package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IFinancialAnalysisService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FinancialAnalysis;
import org.example.stage_atb.Mappers.FinancialAnalysisMapper;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.FinancialAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FinancialAnalysisServiceImpl implements IFinancialAnalysisService {

    private final FinancialAnalysisRepository financialAnalysisRepository;
    private final FinancialAnalysisMapper financialAnalysisMapper;
    private final CreditRequestRepository creditRequestRepository;
    private final IUserService userService;

    @Override
    public FinancialAnalysisResponseDTO createFinancialAnalysis(FinancialAnalysisRequestDTO requestDTO) {
        log.info("Creating financial analysis for credit request: {}", requestDTO.getCreditRequestId());

        CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Credit request not found"));

        FinancialAnalysis analysis = financialAnalysisMapper.toEntity(requestDTO);
        analysis.setCreditRequest(creditRequest);
        analysis.setAnalyst(userService.getCurrentUser());

        FinancialAnalysis savedAnalysis = financialAnalysisRepository.save(analysis);
        return financialAnalysisMapper.toResponseDTO(savedAnalysis);
    }

    @Override
    public FinancialAnalysisResponseDTO getFinancialAnalysisById(String id) {
        FinancialAnalysis analysis = financialAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Financial analysis not found"));
        return financialAnalysisMapper.toResponseDTO(analysis);
    }

    @Override
    public FinancialAnalysisResponseDTO getFinancialAnalysisByCreditRequest(String creditRequestId) {
        FinancialAnalysis analysis = financialAnalysisRepository.findByCreditRequestId(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Financial analysis not found for credit request"));
        return financialAnalysisMapper.toResponseDTO(analysis);
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getFinancialAnalysesByAnalyst(String analystId) {
        return financialAnalysisRepository.findByAnalystId(analystId)
                .stream()
                .map(financialAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getAllFinancialAnalyses() {
        return financialAnalysisRepository.findAll()
                .stream()
                .map(financialAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FinancialAnalysisResponseDTO updateFinancialAnalysis(String id, FinancialAnalysisRequestDTO requestDTO) {
        FinancialAnalysis analysis = financialAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Financial analysis not found"));

        financialAnalysisMapper.updateEntity(analysis, requestDTO);

        FinancialAnalysis updated = financialAnalysisRepository.save(analysis);
        return financialAnalysisMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteFinancialAnalysis(String id) {
        if (!financialAnalysisRepository.existsById(id)) {
            throw new RuntimeException("Financial analysis not found");
        }
        financialAnalysisRepository.deleteById(id);
    }

    @Override
    public FinancialAnalysisResponseDTO approveFinancialAnalysis(String id) {
        FinancialAnalysis analysis = financialAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Financial analysis not found"));

        analysis.setApprovedByAnalyst(true);
        FinancialAnalysis updated = financialAnalysisRepository.save(analysis);
        return financialAnalysisMapper.toResponseDTO(updated);
    }

    @Override
    public FinancialAnalysisResponseDTO performAIAnalysis(String creditRequestId) {
        // Simuler une analyse IA
        // Dans la réalité, vous appelleriez un service IA externe
        log.info("Performing AI analysis for credit request: {}", creditRequestId);

        FinancialAnalysisRequestDTO requestDTO = new FinancialAnalysisRequestDTO();
        requestDTO.setCreditRequestId(creditRequestId);
        // Ajouter des données simulées
        requestDTO.setFinancialHealthScore("GOOD");
        requestDTO.setAnalysisSummary("AI Analysis completed successfully");

        return createFinancialAnalysis(requestDTO);
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getPendingAnalyses() {
        return financialAnalysisRepository.findPendingAnalyses()
                .stream()
                .map(financialAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getApprovedAnalyses() {
        return financialAnalysisRepository.findApprovedAnalyses()
                .stream()
                .map(financialAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}