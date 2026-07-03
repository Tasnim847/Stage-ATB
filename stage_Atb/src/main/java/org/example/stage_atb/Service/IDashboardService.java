package org.example.stage_atb.Service;


import org.example.stage_atb.dto.response.DashboardStatsResponseDTO;

public interface IDashboardService {

    DashboardStatsResponseDTO getDashboardStats();

    DashboardStatsResponseDTO getDashboardStatsByAdvisor(String advisorId);

    DashboardStatsResponseDTO getDashboardStatsByDateRange(String startDate, String endDate);
}