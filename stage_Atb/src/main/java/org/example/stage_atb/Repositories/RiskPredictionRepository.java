package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, String> {

    List<RiskPrediction> findByCreditRequestId(String creditRequestId);

    @Query("SELECT rp FROM RiskPrediction rp WHERE rp.defaultProbability >= :threshold")
    List<RiskPrediction> findHighDefaultProbability(@Param("threshold") BigDecimal threshold);

    @Query("SELECT rp FROM RiskPrediction rp WHERE rp.creditRequest.client.id = :clientId")
    List<RiskPrediction> findByClientId(@Param("clientId") String clientId);

    @Query("SELECT AVG(rp.defaultProbability) FROM RiskPrediction rp")
    Double averageDefaultProbability();
}