package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByGeneratedById(String userId);

    List<Report> findByCreditRequestId(String creditRequestId);

    List<Report> findByReportType(String reportType);

    @Query("SELECT r FROM Report r WHERE r.generatedByAI = true")
    List<Report> findAIGeneratedReports();

    @Query("SELECT r FROM Report r WHERE r.generatedAt BETWEEN :startDate AND :endDate")
    List<Report> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT r FROM Report r ORDER BY r.generatedAt DESC")
    List<Report> findLatestReports();
}