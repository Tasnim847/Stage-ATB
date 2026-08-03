// FinancialAnalysisController.java - CORRIGÉ
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.request.RatioCalculationRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.Service.IFinancialAnalysisService;
import org.example.stage_atb.dto.response.RatioCalculationResponseDTO;
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

    // ✅ ENDPOINT POUR CALCULER LES RATIOS
    @PostMapping("/ratios/calculate")
    public ResponseEntity<RatioCalculationResponseDTO> calculateRatios(
            @Valid @RequestBody RatioCalculationRequestDTO request) {
        RatioCalculationResponseDTO response = analysisService.calculateRatios(request);
        return ResponseEntity.ok(response);
    }

    // ✅ ENDPOINT POUR L'ANALYSE FINANCIÈRE
    @PostMapping("/analyze")
    public ResponseEntity<FinancialAnalysisResponseDTO> analyzeFinancialSituation(
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        FinancialAnalysisResponseDTO response = analysisService.calculateAndSaveAnalysis(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ✅ 3. Simulation (optionnel)
    @PostMapping("/simulate")
    public ResponseEntity<FinancialAnalysisResponseDTO> simulate(
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        FinancialAnalysisResponseDTO response = analysisService.calculateAndSaveAnalysis(request);
        return ResponseEntity.ok(response);
    }

    // ✅ 4. Récupérer par ID
    @GetMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(analysisService.getAnalysisById(id));
    }

    // ✅ 5. Récupérer par client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getByClient(@PathVariable String clientId) {
        return ResponseEntity.ok(analysisService.getAnalysesByClient(clientId));
    }

    // ✅ 6. Récupérer par demande de crédit
    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getByCreditRequest(
            @PathVariable String creditRequestId) {
        return ResponseEntity.ok(analysisService.getAnalysesByCreditRequest(creditRequestId));
    }

    // ✅ 7. Toutes les analyses
    @GetMapping("/all")
    public ResponseEntity<List<FinancialAnalysisResponseDTO>> getAll() {
        return ResponseEntity.ok(analysisService.getAllAnalyses());
    }

    // ✅ 8. Approuver
    @PostMapping("/{id}/approve")
    public ResponseEntity<FinancialAnalysisResponseDTO> approve(
            @PathVariable String id,
            @RequestParam String analystId) {
        return ResponseEntity.ok(analysisService.approveAnalysis(id, analystId));
    }

    // ✅ 9. Rejeter
    @PostMapping("/{id}/reject")
    public ResponseEntity<FinancialAnalysisResponseDTO> reject(
            @PathVariable String id,
            @RequestParam String analystId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(analysisService.rejectAnalysis(id, analystId, reason));
    }

    // ✅ 10. Mettre à jour
    @PutMapping("/{id}")
    public ResponseEntity<FinancialAnalysisResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody FinancialAnalysisRequestDTO request) {
        return ResponseEntity.ok(analysisService.updateAnalysis(id, request));
    }

    // ✅ 11. Supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        analysisService.deleteAnalysis(id);
        return ResponseEntity.noContent().build();
    }
}