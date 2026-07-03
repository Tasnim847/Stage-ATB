package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IRiskAnalysisService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.RiskAnalysisRequestDTO;
import org.example.stage_atb.dto.response.RiskAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.RiskAnalysis;
import org.example.stage_atb.enums.RiskLevel;
import org.example.stage_atb.Mappers.RiskAnalysisMapper;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.RiskAnalysisRepository;
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
public class RiskAnalysisServiceImpl implements IRiskAnalysisService {

    private final RiskAnalysisRepository riskAnalysisRepository;
    private final RiskAnalysisMapper riskAnalysisMapper;
    private final CreditRequestRepository creditRequestRepository;
    private final IUserService userService;

    @Override
    public RiskAnalysisResponseDTO createRiskAnalysis(RiskAnalysisRequestDTO requestDTO) {
        log.info("Creating risk analysis for credit request: {}", requestDTO.getCreditRequestId());

        CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Credit request not found"));

        RiskAnalysis analysis = riskAnalysisMapper.toEntity(requestDTO);
        analysis.setCreditRequest(creditRequest);
        analysis.setAnalyst(userService.getCurrentUser());

        RiskAnalysis savedAnalysis = riskAnalysisRepository.save(analysis);
        return riskAnalysisMapper.toResponseDTO(savedAnalysis);
    }

    @Override
    public RiskAnalysisResponseDTO getRiskAnalysisById(String id) {
        RiskAnalysis analysis = riskAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk analysis not found"));
        return riskAnalysisMapper.toResponseDTO(analysis);
    }

    @Override
    public RiskAnalysisResponseDTO getRiskAnalysisByCreditRequest(String creditRequestId) {
        RiskAnalysis analysis = riskAnalysisRepository.findByCreditRequestId(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Risk analysis not found for credit request"));
        return riskAnalysisMapper.toResponseDTO(analysis);
    }

    @Override
    public List<RiskAnalysisResponseDTO> getRiskAnalysesByAnalyst(String analystId) {
        return riskAnalysisRepository.findByAnalystId(analystId)
                .stream()
                .map(riskAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RiskAnalysisResponseDTO> getRiskAnalysesByLevel(RiskLevel riskLevel) {
        return riskAnalysisRepository.findByOverallRisk(riskLevel)
                .stream()
                .map(riskAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RiskAnalysisResponseDTO> getAllRiskAnalyses() {
        return riskAnalysisRepository.findAll()
                .stream()
                .map(riskAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RiskAnalysisResponseDTO updateRiskAnalysis(String id, RiskAnalysisRequestDTO requestDTO) {
        RiskAnalysis analysis = riskAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk analysis not found"));

        riskAnalysisMapper.updateEntity(analysis, requestDTO);

        RiskAnalysis updated = riskAnalysisRepository.save(analysis);
        return riskAnalysisMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteRiskAnalysis(String id) {
        if (!riskAnalysisRepository.existsById(id)) {
            throw new RuntimeException("Risk analysis not found");
        }
        riskAnalysisRepository.deleteById(id);
    }

    @Override
    public RiskAnalysisResponseDTO performAIRiskAssessment(String creditRequestId) {
        // Simuler une évaluation de risque par IA
        log.info("Performing AI risk assessment for credit request: {}", creditRequestId);

        RiskAnalysisRequestDTO requestDTO = new RiskAnalysisRequestDTO();
        requestDTO.setCreditRequestId(creditRequestId);
        requestDTO.setOverallRisk(RiskLevel.MODERATE);
        requestDTO.setRiskScore(new java.math.BigDecimal("65.5"));
        requestDTO.setRiskDescription("Moderate risk detected by AI");

        return createRiskAnalysis(requestDTO);
    }

    @Override
    public List<RiskAnalysisResponseDTO> getAnomaliesDetected() {
        return riskAnalysisRepository.findAnomaliesDetected()
                .stream()
                .map(riskAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RiskAnalysisResponseDTO> getHighRiskAnalyses() {
        return riskAnalysisRepository.findByOverallRiskIn(
                        List.of(RiskLevel.HIGH, RiskLevel.VERY_HIGH, RiskLevel.CRITICAL))
                .stream()
                .map(riskAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Object[]> getRiskLevelDistribution() {
        return riskAnalysisRepository.countByRiskLevelGrouped();
    }
}