package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IDashboardService;
import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final IDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStats() {
        DashboardStatsResponseDTO response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/advisor/{advisorId}")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStatsByAdvisor(@PathVariable String advisorId) {
        DashboardStatsResponseDTO response = dashboardService.getDashboardStatsByAdvisor(advisorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/date-range")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStatsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        DashboardStatsResponseDTO response = dashboardService.getDashboardStatsByDateRange(startDate, endDate);
        return ResponseEntity.ok(response);
    }
}