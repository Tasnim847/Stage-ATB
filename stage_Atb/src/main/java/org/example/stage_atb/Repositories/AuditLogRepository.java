// repository/AuditLogRepository.java - Version corrigée avec CAST
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    // ✅ Version corrigée : Utiliser CAST pour convertir les paramètres
    @Query(value = "SELECT a.* FROM audit_logs a " +
            "LEFT JOIN users u ON u.id = a.user_id " +
            "WHERE (CAST(:userId AS text) IS NULL OR a.user_id = CAST(:userId AS UUID)) " +
            "AND (CAST(:username AS text) IS NULL OR u.username ILIKE CONCAT('%', CAST(:username AS text), '%')) " +
            "AND (CAST(:actionType AS text) IS NULL OR CAST(a.action AS text) ILIKE CONCAT('%', CAST(:actionType AS text), '%')) " +
            "AND (CAST(:status AS text) IS NULL OR CAST(a.details AS text) ILIKE CONCAT('%', CAST(:status AS text), '%')) " +
            "AND (CAST(:module AS text) IS NULL OR CAST(a.entity_type AS text) ILIKE CONCAT('%', CAST(:module AS text), '%')) " +
            "AND (CAST(:startDate AS text) IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) " +
            "AND (CAST(:endDate AS text) IS NULL OR a.timestamp <= CAST(:endDate AS timestamp)) " +
            "AND (CAST(:searchTerm AS text) IS NULL OR " +
            "CAST(a.action AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
            "CAST(a.details AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
            "u.email ILIKE CONCAT('%', CAST(:searchTerm AS text), '%')) " +
            "ORDER BY a.timestamp DESC",
            countQuery = "SELECT COUNT(*) FROM audit_logs a " +
                    "LEFT JOIN users u ON u.id = a.user_id " +
                    "WHERE (CAST(:userId AS text) IS NULL OR a.user_id = CAST(:userId AS UUID)) " +
                    "AND (CAST(:username AS text) IS NULL OR u.username ILIKE CONCAT('%', CAST(:username AS text), '%')) " +
                    "AND (CAST(:actionType AS text) IS NULL OR CAST(a.action AS text) ILIKE CONCAT('%', CAST(:actionType AS text), '%')) " +
                    "AND (CAST(:status AS text) IS NULL OR CAST(a.details AS text) ILIKE CONCAT('%', CAST(:status AS text), '%')) " +
                    "AND (CAST(:module AS text) IS NULL OR CAST(a.entity_type AS text) ILIKE CONCAT('%', CAST(:module AS text), '%')) " +
                    "AND (CAST(:startDate AS text) IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) " +
                    "AND (CAST(:endDate AS text) IS NULL OR a.timestamp <= CAST(:endDate AS timestamp)) " +
                    "AND (CAST(:searchTerm AS text) IS NULL OR " +
                    "CAST(a.action AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                    "CAST(a.details AS text) ILIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                    "u.email ILIKE CONCAT('%', CAST(:searchTerm AS text), '%'))",
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

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action LIKE '%LOGIN%' AND a.details NOT LIKE '%ERROR%'")
    long countSuccessfulLogins();

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action LIKE '%LOGIN%' AND a.details LIKE '%ERROR%'")
    long countFailedLogins();

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.timestamp >= :startDate")
    long countSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT a.user.id, COUNT(a) as count FROM AuditLog a GROUP BY a.user.id ORDER BY count DESC")
    List<Object[]> findMostActiveUsers(Pageable pageable);
}