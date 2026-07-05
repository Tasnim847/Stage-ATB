package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IRiskAnalysisService;
import org.example.stage_atb.dto.request.RiskAnalysisRequestDTO;
import org.example.stage_atb.dto.response.RiskAnalysisResponseDTO;
import org.example.stage_atb.enums.RiskLevel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risk-analyses")
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final IRiskAnalysisService riskAnalysisService;

    @PostMapping
    public ResponseEntity<RiskAnalysisResponseDTO> createRiskAnalysis(
            @Valid @RequestBody RiskAnalysisRequestDTO requestDTO) {
        RiskAnalysisResponseDTO response = riskAnalysisService.createRiskAnalysis(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskAnalysisResponseDTO> getRiskAnalysisById(@PathVariable String id) {
        RiskAnalysisResponseDTO response = riskAnalysisService.getRiskAnalysisById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<RiskAnalysisResponseDTO> getRiskAnalysisByCreditRequest(
            @PathVariable String creditRequestId) {
        RiskAnalysisResponseDTO response = riskAnalysisService.getRiskAnalysisByCreditRequest(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<RiskAnalysisResponseDTO>> getRiskAnalysesByAnalyst(
            @PathVariable String analystId) {
        List<RiskAnalysisResponseDTO> response = riskAnalysisService.getRiskAnalysesByAnalyst(analystId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/level/{riskLevel}")
    public ResponseEntity<List<RiskAnalysisResponseDTO>> getRiskAnalysesByLevel(
            @PathVariable RiskLevel riskLevel) {
        List<RiskAnalysisResponseDTO> response = riskAnalysisService.getRiskAnalysesByLevel(riskLevel);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RiskAnalysisResponseDTO>> getAllRiskAnalyses() {
        List<RiskAnalysisResponseDTO> response = riskAnalysisService.getAllRiskAnalyses();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RiskAnalysisResponseDTO> updateRiskAnalysis(
            @PathVariable String id,
            @Valid @RequestBody RiskAnalysisRequestDTO requestDTO) {
        RiskAnalysisResponseDTO response = riskAnalysisService.updateRiskAnalysis(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRiskAnalysis(@PathVariable String id) {
        riskAnalysisService.deleteRiskAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai/{creditRequestId}")
    public ResponseEntity<RiskAnalysisResponseDTO> performAIRiskAssessment(
            @PathVariable String creditRequestId) {
        RiskAnalysisResponseDTO response = riskAnalysisService.performAIRiskAssessment(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<RiskAnalysisResponseDTO>> getAnomaliesDetected() {
        List<RiskAnalysisResponseDTO> response = riskAnalysisService.getAnomaliesDetected();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<RiskAnalysisResponseDTO>> getHighRiskAnalyses() {
        List<RiskAnalysisResponseDTO> response = riskAnalysisService.getHighRiskAnalyses();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/distribution/risk-level")
    public ResponseEntity<List<Object[]>> getRiskLevelDistribution() {
        List<Object[]> distribution = riskAnalysisService.getRiskLevelDistribution();
        return ResponseEntity.ok(distribution);
    }
}