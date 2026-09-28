package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IDashboardService;
import org.example.stage_atb.dto.response.AnalystPerformanceDTO;
import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;
import org.example.stage_atb.dto.response.RecentActivityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/stats/advisor/{advisorId}")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStatsByAdvisor(@PathVariable String advisorId) {
        return ResponseEntity.ok(dashboardService.getDashboardStatsByAdvisor(advisorId));
    }

    @GetMapping("/stats/date-range")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStatsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(dashboardService.getDashboardStatsByDateRange(startDate, endDate));
    }

    // ⬇️ NOUVEAUX ENDPOINTS
    @GetMapping("/analysts/top")
    public ResponseEntity<List<AnalystPerformanceDTO>> getTopAnalysts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getTopAnalysts(limit));
    }

    @GetMapping("/activities/recent")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentActivities(limit));
    }
}