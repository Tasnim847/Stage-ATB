package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.PremiumCopilotAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PremiumCopilotAnalysisRepository extends JpaRepository<PremiumCopilotAnalysis, String> {

    List<PremiumCopilotAnalysis> findByAnalystId(String analystId);

    List<PremiumCopilotAnalysis> findByCreditRequestId(String creditRequestId);

    @Query("SELECT pca FROM PremiumCopilotAnalysis pca WHERE pca.creditRequest.client.id = :clientId")
    List<PremiumCopilotAnalysis> findByClientId(@Param("clientId") String clientId);

    @Query("SELECT pca FROM PremiumCopilotAnalysis pca ORDER BY pca.createdAt DESC")
    List<PremiumCopilotAnalysis> findLatestAnalyses();
}