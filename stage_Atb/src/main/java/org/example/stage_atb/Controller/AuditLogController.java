// Controller/AuditLogController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAuditLogService;
import org.example.stage_atb.dto.request.AuditLogFilterRequest;
import org.example.stage_atb.dto.response.AuditLogResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final IAuditLogService auditLogService;

    // Controller/AuditLogController.java - CORRIGÉ
    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDTO>> getAuditLogs(AuditLogFilterRequest filterRequest) {
        log.info("📋 Récupération des logs d'audit avec filtres");
        log.info("🔍 Filtres: userId={}, username={}, actionType={}, status={}, module={}",
                filterRequest.getUserId(), filterRequest.getUsername(),
                filterRequest.getActionType(), filterRequest.getStatus(), filterRequest.getModule());
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(filterRequest);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AuditLogResponseDTO>> getRecentLogs(
            @RequestParam(defaultValue = "50") int limit) {
        log.info("📋 Récupération des {} logs récents", limit);
        List<AuditLogResponseDTO> logs = auditLogService.getRecentLogs(limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.info("📊 Récupération des statistiques d'audit");
        Map<String, Object> stats = auditLogService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}