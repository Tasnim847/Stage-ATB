// FinancialAnalysisController.java - CORRIGÉ
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.Service.IFinancialAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/financial-analysis")
@RequiredArgsConstructor
public class FinancialAnalysisController {

    private final IFinancialAnalysisService analysisService;

    @PostMapping("/calculate")
    public ResponseEntity<FinancialAnalysisResponseDTO> calculateAndSave(
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        FinancialAnalysisResponseDTO response = analysisService.calculateAndSaveAnalysis(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/simulate")
    public ResponseEntity<FinancialAnalysisResponseDTO> simulate(
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        FinancialAnalysisResponseDTO response = analysisService.calculateAndSaveAnalysis(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> getById(@PathVariable String id) {
        FinancialAnalysisResponseDTO response = analysisService.getAnalysisById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getByClient(@PathVariable String clientId) {
        List<FinancialAnalysisResponseDTO> responses = analysisService.getAnalysesByClient(clientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getByCreditRequest(
            @PathVariable String creditRequestId) {
        List<FinancialAnalysisResponseDTO> responses = analysisService.getAnalysesByCreditRequest(creditRequestId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/analyst/{analystId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getByAnalyst(@PathVariable String analystId) {
        List<FinancialAnalysisResponseDTO> responses = analysisService.getAnalysesByAnalyst(analystId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getAll() {
        List<FinancialAnalysisResponseDTO> responses = analysisService.getAllAnalyses();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        FinancialAnalysisResponseDTO response = analysisService.updateAnalysis(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        analysisService.deleteAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ CORRECTION ICI - Supprimer le 3ème paramètre null
    @PostMapping("/{id}/approve")
    public ResponseEntity<FinancialAnalysisResponseDTO> approve(
            @PathVariable String id,
            @RequestParam String analystId) {
        // La méthode approveAnalysis n'accepte que 2 paramètres
        FinancialAnalysisResponseDTO response = analysisService.approveAnalysis(id, analystId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<FinancialAnalysisResponseDTO> reject(
            @PathVariable String id,
            @RequestParam String analystId,
            @RequestParam(required = false) String reason) {
        FinancialAnalysisResponseDTO response = analysisService.rejectAnalysis(id, analystId, reason);
        return ResponseEntity.ok(response);
    }
}