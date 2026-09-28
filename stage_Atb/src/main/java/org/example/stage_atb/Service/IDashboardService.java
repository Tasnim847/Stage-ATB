package org.example.stage_atb.Service;

import org.example.stage_atb.dto.response.AnalystPerformanceDTO;
import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;
import org.example.stage_atb.dto.response.RecentActivityDTO;

import java.util.List;

public interface IDashboardService {

    // ===== STATISTIQUES GÉNÉRALES =====
    DashboardStatsResponseDTO getDashboardStats();

    DashboardStatsResponseDTO getDashboardStatsByAdvisor(String advisorId);

    DashboardStatsResponseDTO getDashboardStatsByDateRange(String startDate, String endDate);

    // ===== TOP ANALYSTES =====
    List<AnalystPerformanceDTO> getTopAnalysts(int limit);

    // ===== ACTIVITÉS RÉCENTES =====
    List<RecentActivityDTO> getRecentActivities(int limit);
}