// Controller/ManagerValidationController.java
package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IManagerValidationService;
import org.example.stage_atb.dto.request.DecisionReturnRequest;
import org.example.stage_atb.dto.request.ValidationRequest;
import org.example.stage_atb.dto.response.ValidationResponseDTO;
import org.example.stage_atb.dto.response.ValidationSummaryDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/validation")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class ManagerValidationController {

    private final IManagerValidationService validationService;

    // ============================================
    // VALIDER LES DÉCISIONS IMPORTANTES
    // ============================================

    @GetMapping("/pending")
    public ResponseEntity<List<ValidationSummaryDTO>> getPendingValidations() {
        log.info("GET /api/manager/validation/pending");
        return ResponseEntity.ok(validationService.getPendingValidations());
    }

    @GetMapping("/high-amount")
    public ResponseEntity<List<ValidationSummaryDTO>> getHighAmountValidations(
            @RequestParam(required = false) BigDecimal minAmount) {
        log.info("GET /api/manager/validation/high-amount");
        return ResponseEntity.ok(validationService.getHighAmountValidations(minAmount));
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<ValidationSummaryDTO>> getHighRiskValidations(
            @RequestParam(required = false) BigDecimal riskThreshold) {
        log.info("GET /api/manager/validation/high-risk");
        return ResponseEntity.ok(validationService.getHighRiskValidations(riskThreshold));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ValidationSummaryDTO>> getPendingValidationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/validation/date-range");
        return ResponseEntity.ok(validationService.getPendingValidationsByDateRange(startDate, endDate));
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidationResponseDTO> validateDecision(
            @Valid @RequestBody ValidationRequest request) {
        log.info("POST /api/manager/validation/validate - Request: {}", request.getCreditRequestId());
        return ResponseEntity.ok(validationService.validateDecision(request));
    }

    @PostMapping("/approve-high-amount/{creditRequestId}")
    public ResponseEntity<ValidationResponseDTO> approveHighAmountCredit(
            @PathVariable String creditRequestId,
            @RequestParam(required = false) String comments) {
        log.info("POST /api/manager/validation/approve-high-amount/{}", creditRequestId);
        return ResponseEntity.ok(validationService.approveHighAmountCredit(creditRequestId, comments));
    }

    @PostMapping("/reject/{creditRequestId}")
    public ResponseEntity<ValidationResponseDTO> rejectDecision(
            @PathVariable String creditRequestId,
            @RequestParam String reason,
            @RequestParam(required = false) String comments) {
        log.info("POST /api/manager/validation/reject/{}", creditRequestId);
        return ResponseEntity.ok(validationService.rejectDecision(creditRequestId, reason, comments));
    }

    @PostMapping("/return-to-analyst")
    public ResponseEntity<ValidationResponseDTO> returnToAnalyst(
            @Valid @RequestBody DecisionReturnRequest request) {
        log.info("POST /api/manager/validation/return-to-analyst - Request: {}", request.getCreditRequestId());
        return ResponseEntity.ok(validationService.returnToAnalyst(request));
    }

    // ============================================
    // STATISTIQUES ET SUIVI
    // ============================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getValidationStats() {
        log.info("GET /api/manager/validation/stats");
        return ResponseEntity.ok(validationService.getValidationStats());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ValidationResponseDTO>> getValidationHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/validation/history");
        return ResponseEntity.ok(validationService.getValidationHistory(startDate, endDate));
    }

    @GetMapping("/details/{creditRequestId}")
    public ResponseEntity<ValidationResponseDTO> getValidationDetails(
            @PathVariable String creditRequestId) {
        log.info("GET /api/manager/validation/details/{}", creditRequestId);
        return ResponseEntity.ok(validationService.getValidationDetails(creditRequestId));
    }

    @GetMapping("/requires-validation/{creditRequestId}")
    public ResponseEntity<Map<String, Object>> requiresManagerValidation(
            @PathVariable String creditRequestId) {
        log.info("GET /api/manager/validation/requires-validation/{}", creditRequestId);
        // Implémenter la vérification
        boolean requires = validationService.requiresManagerValidation(null);
        return ResponseEntity.ok(Map.of(
                "requiresValidation", requires,
                "creditRequestId", creditRequestId
        ));
    }

    @GetMapping("/report")
    public ResponseEntity<String> generateValidationReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/validation/report");
        String report = validationService.generateValidationReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}