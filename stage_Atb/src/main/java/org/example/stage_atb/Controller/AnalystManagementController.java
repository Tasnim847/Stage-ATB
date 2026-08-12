// Controller/AnalystManagementController.java
package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAnalystManagementService;
import org.example.stage_atb.dto.request.AnalystAssignmentRequest;
import org.example.stage_atb.dto.request.BatchAssignmentRequest;
import org.example.stage_atb.dto.response.AnalystPerformanceDTO;
import org.example.stage_atb.dto.response.AnalystWorkloadDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.CreditRequestSummaryDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/analysts")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class AnalystManagementController {

    private final IAnalystManagementService analystManagementService;

    // ============================================
    // VOIR LES DOSSIERS TRAITÉS
    // ============================================

    @GetMapping("/processed-files")
    public ResponseEntity<List<CreditResponseDTO>> getAllProcessedFiles() {
        log.info("GET /api/manager/analysts/processed-files");
        return ResponseEntity.ok(analystManagementService.getAllProcessedFiles());
    }

    @GetMapping("/processed-files/{analystId}")
    public ResponseEntity<List<CreditResponseDTO>> getProcessedFilesByAnalyst(
            @PathVariable String analystId) {
        log.info("GET /api/manager/analysts/processed-files/{}", analystId);
        return ResponseEntity.ok(analystManagementService.getProcessedFilesByAnalyst(analystId));
    }

    @GetMapping("/processed-files/date-range")
    public ResponseEntity<List<CreditResponseDTO>> getProcessedFilesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/analysts/processed-files/date-range?start={}&end={}", startDate, endDate);
        return ResponseEntity.ok(analystManagementService.getProcessedFilesByDateRange(startDate, endDate));
    }

    @GetMapping("/pending-assignment")
    public ResponseEntity<List<CreditRequestSummaryDTO>> getPendingAssignmentRequests() {
        log.info("GET /api/manager/analysts/pending-assignment");
        return ResponseEntity.ok(analystManagementService.getPendingAssignmentRequests());
    }

    // ============================================
    // RÉPARTIR LES DOSSIERS
    // ============================================

    @PostMapping("/assign")
    public ResponseEntity<CreditResponseDTO> assignRequestToAnalyst(
            @Valid @RequestBody AnalystAssignmentRequest request) {
        log.info("POST /api/manager/analysts/assign - Request: {}", request.getCreditRequestId());
        return ResponseEntity.ok(analystManagementService.assignRequestToAnalyst(request));
    }

    @PostMapping("/assign/batch")
    public ResponseEntity<List<CreditResponseDTO>> batchAssignRequests(
            @Valid @RequestBody BatchAssignmentRequest request) {
        log.info("POST /api/manager/analysts/assign/batch - {} assignments",
                request.getAssignments().size());
        return ResponseEntity.ok(analystManagementService.batchAssignRequests(request));
    }

    @PostMapping("/distribute/auto")
    public ResponseEntity<Map<String, List<CreditResponseDTO>>> autoDistributeRequests(
            @RequestBody List<String> creditRequestIds) {
        log.info("POST /api/manager/analysts/distribute/auto - {} requests",
                creditRequestIds.size());
        return ResponseEntity.ok(analystManagementService.autoDistributeRequests(creditRequestIds));
    }

    @PostMapping("/rebalance")
    public ResponseEntity<Map<String, List<CreditResponseDTO>>> rebalanceWorkload() {
        log.info("POST /api/manager/analysts/rebalance");
        return ResponseEntity.ok(analystManagementService.rebalanceWorkload());
    }

    @PatchMapping("/reassign/{creditRequestId}")
    public ResponseEntity<CreditResponseDTO> reassignRequest(
            @PathVariable String creditRequestId,
            @RequestParam String newAnalystId,
            @RequestParam(required = false) String reason) {
        log.info("PATCH /api/manager/analysts/reassign/{} to {}", creditRequestId, newAnalystId);
        return ResponseEntity.ok(analystManagementService.reassignRequest(
                creditRequestId, newAnalystId, reason));
    }

    // ============================================
    // SUIVRE LES PERFORMANCES
    // ============================================

    @GetMapping("/performance")
    public ResponseEntity<List<AnalystPerformanceDTO>> getAllAnalystPerformance() {
        log.info("GET /api/manager/analysts/performance");
        return ResponseEntity.ok(analystManagementService.getAllAnalystPerformance());
    }

    @GetMapping("/performance/{analystId}")
    public ResponseEntity<AnalystPerformanceDTO> getAnalystPerformance(
            @PathVariable String analystId) {
        log.info("GET /api/manager/analysts/performance/{}", analystId);
        return ResponseEntity.ok(analystManagementService.getAnalystPerformance(analystId));
    }

    @GetMapping("/workload")
    public ResponseEntity<List<AnalystWorkloadDTO>> getAllAnalystWorkload() {
        log.info("GET /api/manager/analysts/workload");
        return ResponseEntity.ok(analystManagementService.getAllAnalystWorkload());
    }

    @GetMapping("/workload/{analystId}")
    public ResponseEntity<AnalystWorkloadDTO> getAnalystWorkload(
            @PathVariable String analystId) {
        log.info("GET /api/manager/analysts/workload/{}", analystId);
        return ResponseEntity.ok(analystManagementService.getAnalystWorkload(analystId));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<AnalystPerformanceDTO>> getAnalystRanking() {
        log.info("GET /api/manager/analysts/ranking");
        return ResponseEntity.ok(analystManagementService.getAnalystRanking());
    }

    @GetMapping("/report")
    public ResponseEntity<String> generatePerformanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/analysts/report");
        String report = analystManagementService.generatePerformanceReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}