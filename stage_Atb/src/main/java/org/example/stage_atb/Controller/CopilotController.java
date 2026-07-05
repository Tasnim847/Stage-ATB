package org.example.stage_atb.Controller;


import org.example.stage_atb.Service.ICopilotService;
import org.example.stage_atb.dto.request.CopilotAnalysisRequestDTO;
import org.example.stage_atb.dto.response.CopilotAnalysisResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/copilot")
@RequiredArgsConstructor
public class CopilotController {

    private final ICopilotService copilotService;

    @PostMapping("/analyze")
    public ResponseEntity<CopilotAnalysisResponseDTO> analyzeCreditRequest(
            @Valid @RequestBody CopilotAnalysisRequestDTO requestDTO) {
        CopilotAnalysisResponseDTO response = copilotService.analyzeCreditRequest(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/analysis/{id}")
    public ResponseEntity<CopilotAnalysisResponseDTO> getAnalysisById(@PathVariable String id) {
        CopilotAnalysisResponseDTO response = copilotService.getAnalysisById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getAnalysesByAnalyst(@PathVariable String analystId) {
        List<CopilotAnalysisResponseDTO> response = copilotService.getAnalysesByAnalyst(analystId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getAnalysesByCreditRequest(
            @PathVariable String creditRequestId) {
        List<CopilotAnalysisResponseDTO> response = copilotService.getAnalysesByCreditRequest(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getAllAnalyses() {
        List<CopilotAnalysisResponseDTO> response = copilotService.getAllAnalyses();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getLatestAnalyses(
            @RequestParam(defaultValue = "10") int limit) {
        List<CopilotAnalysisResponseDTO> response = copilotService.getLatestAnalyses(limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getHighRiskAnalyses() {
        List<CopilotAnalysisResponseDTO> response = copilotService.getHighRiskAnalyses();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/risk-level/{riskLevel}")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getAnalysesByRiskLevel(
            @PathVariable String riskLevel) {
        List<CopilotAnalysisResponseDTO> response = copilotService.getAnalysesByRiskLevel(riskLevel);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/analysis/{id}")
    public ResponseEntity<CopilotAnalysisResponseDTO> updateAnalysis(
            @PathVariable String id,
            @Valid @RequestBody CopilotAnalysisRequestDTO requestDTO) {
        CopilotAnalysisResponseDTO response = copilotService.updateAnalysis(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/analysis/{id}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable String id) {
        copilotService.deleteAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/instant/{creditRequestId}")
    public ResponseEntity<CopilotAnalysisResponseDTO> getInstantAnalysis(@PathVariable String creditRequestId) {
        CopilotAnalysisResponseDTO response = copilotService.getInstantAnalysis(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions/{creditRequestId}")
    public ResponseEntity<List<String>> getActionSuggestions(@PathVariable String creditRequestId) {
        List<String> suggestions = copilotService.getActionSuggestions(creditRequestId);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/natural-language")
    public ResponseEntity<String> getNaturalLanguageResponse(
            @RequestParam String query,
            @RequestParam(required = false) String creditRequestId) {
        String response = copilotService.getNaturalLanguageResponse(query, creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/full-analysis/{creditRequestId}")
    public ResponseEntity<CopilotAnalysisResponseDTO> getFullDossierAnalysis(
            @PathVariable String creditRequestId) {
        CopilotAnalysisResponseDTO response = copilotService.getFullDossierAnalysis(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/strategic-report")
    public ResponseEntity<String> generateStrategicReport() {
        String report = copilotService.generateStrategicReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/strategic-report/{date}")
    public ResponseEntity<String> generateStrategicReportForDate(@PathVariable String date) {
        String report = copilotService.generateStrategicReportForDate(date);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/executive-summary")
    public ResponseEntity<String> generateExecutiveSummary() {
        String summary = copilotService.generateExecutiveSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/premium")
    public ResponseEntity<List<CopilotAnalysisResponseDTO>> getPremiumAnalyses() {
        List<CopilotAnalysisResponseDTO> response = copilotService.getPremiumAnalyses();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/analysis/{id}/premium")
    public ResponseEntity<CopilotAnalysisResponseDTO> togglePremiumMode(
            @PathVariable String id,
            @RequestParam boolean enabled) {
        CopilotAnalysisResponseDTO response = copilotService.togglePremiumMode(id, enabled);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countTotalAnalyses() {
        long count = copilotService.countTotalAnalyses();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/analyst/{analystId}")
    public ResponseEntity<Long> countAnalysesByAnalyst(@PathVariable String analystId) {
        long count = copilotService.countAnalysesByAnalyst(analystId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable String id) {
        boolean exists = copilotService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}