package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.RiskAnalysis;
import org.example.stage_atb.enums.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskAnalysisRepository extends JpaRepository<RiskAnalysis, String> {

    Optional<RiskAnalysis> findByCreditRequestId(String creditRequestId);

    List<RiskAnalysis> findByAnalystId(String analystId);

    List<RiskAnalysis> findByOverallRisk(RiskLevel riskLevel);

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.overallRisk IN :riskLevels")
    List<RiskAnalysis> findByOverallRiskIn(@Param("riskLevels") List<RiskLevel> riskLevels);

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.anomalyDetected = true")
    List<RiskAnalysis> findAnomaliesDetected();

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.creditRequest.client.id = :clientId")
    List<RiskAnalysis> findByClientId(@Param("clientId") String clientId);

    @Query("SELECT ra.overallRisk, COUNT(ra) FROM RiskAnalysis ra GROUP BY ra.overallRisk")
    List<Object[]> countByRiskLevelGrouped();
}