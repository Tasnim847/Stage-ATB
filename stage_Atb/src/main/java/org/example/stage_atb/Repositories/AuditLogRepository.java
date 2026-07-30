package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    // ✅ Version NATIVE avec conversion explicite pour TOUTES les colonnes
    @Query(value = "SELECT a.* FROM audit_logs a " +
            "LEFT JOIN users u ON u.id = a.user_id " +
            "WHERE (CAST(:userId AS text) IS NULL OR CAST(a.user_id AS text) = CAST(:userId AS text)) " +
            "AND (CAST(:username AS text) IS NULL OR CAST(u.username AS text) ILIKE CONCAT('%', CAST(:username AS text), '%')) " +
            "AND (CAST(:actionType AS text) IS NULL OR CAST(a.action AS text) ILIKE CONCAT('%', CAST(:actionType AS text), '%')) " +
            "AND (CAST(:status AS text) IS NULL OR CAST(a.details AS text) ILIKE CONCAT('%', CAST(:status AS text), '%')) " +
            "AND (CAST(:module AS text) IS NULL OR CAST(a.entity_type AS text) ILIKE CONCAT('%', CAST(:module AS text), '%')) " +
            "AND (CAST(:startDate AS text) IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) " +
            "AND (CAST(:endDate AS text) IS NULL OR a.timestamp <= CAST(:endDate AS timestamp)) " +
            "AND (CAST(:searchTerm AS text) IS NULL OR " +
            "CAST(a.action AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
            "CAST(a.details AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
            "CAST(u.email AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%')) " +
            "ORDER BY a.timestamp DESC",
            countQuery = "SELECT COUNT(*) FROM audit_logs a " +
                    "LEFT JOIN users u ON u.id = a.user_id " +
                    "WHERE (CAST(:userId AS text) IS NULL OR CAST(a.user_id AS text) = CAST(:userId AS text)) " +
                    "AND (CAST(:username AS text) IS NULL OR CAST(u.username AS text) ILIKE CONCAT('%', CAST(:username AS text), '%')) " +
                    "AND (CAST(:actionType AS text) IS NULL OR CAST(a.action AS text) ILIKE CONCAT('%', CAST(:actionType AS text), '%')) " +
                    "AND (CAST(:status AS text) IS NULL OR CAST(a.details AS text) ILIKE CONCAT('%', CAST(:status AS text), '%')) " +
                    "AND (CAST(:module AS text) IS NULL OR CAST(a.entity_type AS text) ILIKE CONCAT('%', CAST(:module AS text), '%')) " +
                    "AND (CAST(:startDate AS text) IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) " +
                    "AND (CAST(:endDate AS text) IS NULL OR a.timestamp <= CAST(:endDate AS timestamp)) " +
                    "AND (CAST(:searchTerm AS text) IS NULL OR " +
                    "CAST(a.action AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                    "CAST(a.details AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                    "CAST(u.email AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%'))",
            nativeQuery = true)
    Page<AuditLog> findWithFilters(
            @Param("userId") String userId,
            @Param("username") String username,
            @Param("actionType") String actionType,
            @Param("status") String status,
            @Param("module") String module,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    // ✅ Statistiques en NATIVE
    @Query(value = "SELECT COUNT(*) FROM audit_logs a " +
            "WHERE CAST(a.action AS text) ILIKE '%LOGIN%' " +
            "AND (a.details IS NULL OR CAST(a.details AS text) NOT ILIKE '%ERROR%')",
            nativeQuery = true)
    long countSuccessfulLogins();

    @Query(value = "SELECT COUNT(*) FROM audit_logs a " +
            "WHERE CAST(a.action AS text) ILIKE '%LOGIN%' " +
            "AND CAST(a.details AS text) ILIKE '%ERROR%'",
            nativeQuery = true)
    long countFailedLogins();

    @Query(value = "SELECT COUNT(*) FROM audit_logs a WHERE a.timestamp >= CAST(:startDate AS timestamp)",
            nativeQuery = true)
    long countSince(@Param("startDate") LocalDateTime startDate);
}