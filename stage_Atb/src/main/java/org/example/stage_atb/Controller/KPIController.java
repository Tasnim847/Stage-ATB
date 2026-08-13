// Controller/KPIController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IKPIService;
import org.example.stage_atb.dto.response.AnalystKPIDTO;
import org.example.stage_atb.dto.response.ManagerKPIDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/manager/kpis")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class KPIController {

    private final IKPIService kpiService;

    /**
     * Récupérer tous les KPIs pour le tableau de bord manager
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ManagerKPIDTO> getManagerKPIs() {
        log.info("GET /api/manager/kpis/dashboard");
        return ResponseEntity.ok(kpiService.getManagerKPIs());
    }

    /**
     * Récupérer les KPIs par période
     */
    @GetMapping("/date-range")
    public ResponseEntity<ManagerKPIDTO> getKPIsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/manager/kpis/date-range?start={}&end={}", startDate, endDate);
        return ResponseEntity.ok(kpiService.getKPIsByDateRange(startDate, endDate));
    }

    /**
     * Récupérer les KPIs de performance des analystes
     */
    @GetMapping("/analysts/performance")
    public ResponseEntity<List<AnalystKPIDTO>> getAnalystPerformanceKPIs() {
        log.info("GET /api/manager/kpis/analysts/performance");
        return ResponseEntity.ok(kpiService.getAnalystPerformanceKPIs());
    }

    /**
     * Récupérer les KPIs de validation manager
     */
    @GetMapping("/validation")
    public ResponseEntity<Object> getManagerValidationKPIs() {
        log.info("GET /api/manager/kpis/validation");
        return ResponseEntity.ok(kpiService.getManagerValidationKPIs());
    }
}