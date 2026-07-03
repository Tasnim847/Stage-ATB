package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.FraudAlert;
import org.example.stage_atb.enums.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {

    List<FraudAlert> findByClientId(String clientId);

    List<FraudAlert> findByCreditRequestId(String creditRequestId);

    List<FraudAlert> findBySeverity(RiskLevel severity);

    @Query("SELECT fa FROM FraudAlert fa WHERE fa.reviewed = false")
    List<FraudAlert> findUnreviewedAlerts();

    @Query("SELECT fa FROM FraudAlert fa WHERE fa.confirmed = true AND fa.actionTaken = false")
    List<FraudAlert> findConfirmedUnresolvedAlerts();

    @Query("SELECT fa FROM FraudAlert fa WHERE fa.severity = :severity AND fa.reviewed = false")
    List<FraudAlert> findUnreviewedBySeverity(@Param("severity") RiskLevel severity);

    @Query("SELECT COUNT(fa) FROM FraudAlert fa WHERE fa.confirmed = true")
    long countConfirmedAlerts();
}