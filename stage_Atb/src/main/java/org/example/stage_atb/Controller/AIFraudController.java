// Controller/AIFraudController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAIFraudService;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.dto.response.FraudStatisticsDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/manager/ai/fraud")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class AIFraudController {

    private final IAIFraudService aiFraudService;

    /**
     * Récupérer les alertes de fraude
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<FraudAlertResponseDTO>> getFraudAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity) {
        log.info("GET /api/manager/ai/fraud/alerts - status: {}, severity: {}", status, severity);
        return ResponseEntity.ok(aiFraudService.getFraudAlerts(status, severity));
    }

    /**
     * Récupérer une alerte de fraude par ID
     */
    @GetMapping("/alert/{id}")
    public ResponseEntity<FraudAlertResponseDTO> getFraudAlert(@PathVariable String id) {
        log.info("GET /api/manager/ai/fraud/alert/{}", id);
        return ResponseEntity.ok(aiFraudService.getFraudAlert(id));
    }

    /**
     * Mettre à jour le statut d'une alerte
     */
    @PatchMapping("/alert/{id}/status")
    public ResponseEntity<FraudAlertResponseDTO> updateFraudAlertStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String comments) {
        log.info("PATCH /api/manager/ai/fraud/alert/{}/status - status: {}", id, status);
        return ResponseEntity.ok(aiFraudService.updateFraudAlertStatus(id, status, comments));
    }

    /**
     * Récupérer les statistiques de fraude
     */
    @GetMapping("/statistics")
    public ResponseEntity<FraudStatisticsDTO> getFraudStatistics() {
        log.info("GET /api/manager/ai/fraud/statistics");
        return ResponseEntity.ok(aiFraudService.getFraudStatistics());
    }

    /**
     * Générer un rapport de fraude
     */
    @GetMapping("/report")
    public ResponseEntity<String> generateFraudReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/ai/fraud/report - start: {}, end: {}", startDate, endDate);
        String report = aiFraudService.generateFraudReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}