package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.ClientScoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientScoringRepository extends JpaRepository<ClientScoring, String> {

    Optional<ClientScoring> findByClientId(String clientId);

    @Query("SELECT cs FROM ClientScoring cs WHERE cs.overallScore >= :minScore")
    List<ClientScoring> findByMinScore(@Param("minScore") BigDecimal minScore);

    @Query("SELECT cs FROM ClientScoring cs WHERE cs.overallScore BETWEEN :minScore AND :maxScore")
    List<ClientScoring> findByScoreRange(@Param("minScore") BigDecimal minScore, @Param("maxScore") BigDecimal maxScore);

    @Query("SELECT AVG(cs.overallScore) FROM ClientScoring cs")
    Double averageOverallScore();

    @Query("SELECT cs FROM ClientScoring cs ORDER BY cs.overallScore DESC")
    List<ClientScoring> findTopScorers();

    @Query("SELECT cs.riskCategory, COUNT(cs) FROM ClientScoring cs GROUP BY cs.riskCategory")
    List<Object[]> countByRiskCategoryGrouped();
}