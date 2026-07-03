package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CommercialRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CommercialRecommendationRepository extends JpaRepository<CommercialRecommendation, String> {

    List<CommercialRecommendation> findByClientId(String clientId);

    @Query("SELECT cr FROM CommercialRecommendation cr WHERE cr.implemented = false")
    List<CommercialRecommendation> findPendingImplementations();

    @Query("SELECT cr FROM CommercialRecommendation cr WHERE cr.recommendationType = :type AND cr.implemented = false")
    List<CommercialRecommendation> findPendingByType(@Param("type") String type);

    @Query("SELECT cr FROM CommercialRecommendation cr WHERE cr.estimatedValue >= :minValue ORDER BY cr.estimatedValue DESC")
    List<CommercialRecommendation> findHighValueRecommendations(@Param("minValue") BigDecimal minValue);

    @Query("SELECT cr FROM CommercialRecommendation cr WHERE cr.priority = 'HIGH' AND cr.implemented = false")
    List<CommercialRecommendation> findHighPriorityPending();
}