package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    List<AuditLog> findByUserId(String userId);

    List<AuditLog> findByCreditRequestId(String creditRequestId);

    List<AuditLog> findByAction(String action);

    @Query("SELECT al FROM AuditLog al WHERE al.timestamp BETWEEN :startDate AND :endDate")
    List<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId")
    List<AuditLog> findByEntityTypeAndId(@Param("entityType") String entityType, @Param("entityId") String entityId);

    @Query("SELECT al FROM AuditLog al ORDER BY al.timestamp DESC")
    List<AuditLog> findLatestLogs();
}