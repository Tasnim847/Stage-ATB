// Controller/AIStrategyController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAIStrategyService;
import org.example.stage_atb.dto.request.StrategicReportRequest;
import org.example.stage_atb.dto.response.AIDecisionDTO;
import org.example.stage_atb.dto.response.StrategicReportResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/ai")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class AIStrategyController {

    private final IAIStrategyService aiStrategyService;

    /**
     * Générer un rapport stratégique
     */
    @PostMapping("/strategy/generate")
    public ResponseEntity<StrategicReportResponse> generateStrategicReport(
            @RequestBody StrategicReportRequest request) {
        log.info("POST /api/manager/ai/strategy/generate - period: {}", request.getPeriod());
        return ResponseEntity.ok(aiStrategyService.generateStrategicReport(request));
    }

    /**
     * Récupérer les rapports stratégiques
     */
    @GetMapping("/strategy/reports")
    public ResponseEntity<List<StrategicReportResponse>> getStrategicReports(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/manager/ai/strategy/reports - limit: {}", limit);
        return ResponseEntity.ok(aiStrategyService.getStrategicReports(limit));
    }

    /**
     * Récupérer un rapport par ID
     */
    @GetMapping("/strategy/report/{id}")
    public ResponseEntity<StrategicReportResponse> getStrategicReport(
            @PathVariable String id) {
        log.info("GET /api/manager/ai/strategy/report/{}", id);
        return ResponseEntity.ok(aiStrategyService.getStrategicReport(id));
    }

    /**
     * Récupérer les décisions IA
     */
    @GetMapping("/decisions")
    public ResponseEntity<List<AIDecisionDTO>> getAIDecisions() {
        log.info("GET /api/manager/ai/decisions");
        return ResponseEntity.ok(aiStrategyService.getAIDecisions());
    }

    /**
     * Exporter un rapport
     */
    @GetMapping("/strategy/export/{id}")
    public ResponseEntity<Resource> exportReport(
            @PathVariable String id,
            @RequestParam String format) {
        log.info("GET /api/manager/ai/strategy/export/{} - format: {}", id, format);

        Resource resource = aiStrategyService.exportReport(id, format);

        String contentType = switch (format.toLowerCase()) {
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/json";
        };

        String filename = "rapport-strategique." + format.toLowerCase();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }
}