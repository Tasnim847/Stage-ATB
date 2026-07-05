package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IFinancialAnalysisService;
import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-analyses")
@RequiredArgsConstructor
public class FinancialAnalysisController {

    private final IFinancialAnalysisService financialAnalysisService;

    @PostMapping
    public ResponseEntity<FinancialAnalysisResponseDTO> createFinancialAnalysis(
            @Valid @RequestBody FinancialAnalysisRequestDTO requestDTO) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.createFinancialAnalysis(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> getFinancialAnalysisById(@PathVariable String id) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.getFinancialAnalysisById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<FinancialAnalysisResponseDTO> getFinancialAnalysisByCreditRequest(
            @PathVariable String creditRequestId) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.getFinancialAnalysisByCreditRequest(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getFinancialAnalysesByAnalyst(
            @PathVariable String analystId) {
        List<FinancialAnalysisResponseDTO> response = financialAnalysisService.getFinancialAnalysesByAnalyst(analystId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getAllFinancialAnalyses() {
        List<FinancialAnalysisResponseDTO> response = financialAnalysisService.getAllFinancialAnalyses();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> updateFinancialAnalysis(
            @PathVariable String id,
            @Valid @RequestBody FinancialAnalysisRequestDTO requestDTO) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.updateFinancialAnalysis(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinancialAnalysis(@PathVariable String id) {
        financialAnalysisService.deleteFinancialAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<FinancialAnalysisResponseDTO> approveFinancialAnalysis(@PathVariable String id) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.approveFinancialAnalysis(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai/{creditRequestId}")
    public ResponseEntity<FinancialAnalysisResponseDTO> performAIAnalysis(@PathVariable String creditRequestId) {
        FinancialAnalysisResponseDTO response = financialAnalysisService.performAIAnalysis(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getPendingAnalyses() {
        List<FinancialAnalysisResponseDTO> response = financialAnalysisService.getPendingAnalyses();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getApprovedAnalyses() {
        List<FinancialAnalysisResponseDTO> response = financialAnalysisService.getApprovedAnalyses();
        return ResponseEntity.ok(response);
    }
}