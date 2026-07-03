package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.RegulatoryAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegulatoryAlertRepository extends JpaRepository<RegulatoryAlert, String> {

    List<RegulatoryAlert> findByRegulationType(String regulationType);

    @Query("SELECT ra FROM RegulatoryAlert ra WHERE ra.read = false")
    List<RegulatoryAlert> findUnreadAlerts();

    @Query("SELECT ra FROM RegulatoryAlert ra WHERE ra.acknowledged = false")
    List<RegulatoryAlert> findUnacknowledgedAlerts();

    @Query("SELECT ra FROM RegulatoryAlert ra WHERE ra.effectiveDate BETWEEN :startDate AND :endDate")
    List<RegulatoryAlert> findByEffectiveDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT ra FROM RegulatoryAlert ra ORDER BY ra.effectiveDate DESC")
    List<RegulatoryAlert> findLatestRegulations();
}