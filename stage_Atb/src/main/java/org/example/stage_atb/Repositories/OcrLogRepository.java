package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.OcrLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OcrLogRepository extends JpaRepository<OcrLog, Long> {

    List<OcrLog> findByResult(String result, Pageable pageable);

    @Query("SELECT COUNT(l) FROM OcrLog l WHERE l.result = 'SUCCESS'")
    long countSuccess();

    @Query("SELECT COUNT(l) FROM OcrLog l WHERE l.result = 'ERROR'")
    long countErrors();

    @Query("SELECT COUNT(l) FROM OcrLog l WHERE l.result = 'WARNING'")
    long countWarnings();

    /**
     * Supprime les logs de plus de 30 jours
     * Utilisation d'une requête native pour PostgreSQL
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM ocr_logs WHERE created_at < NOW() - INTERVAL '30 days'", nativeQuery = true)
    void deleteOldLogs();

    /**
     * Alternative avec paramètre pour plus de flexibilité
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OcrLog l WHERE l.createdAt < :dateLimit")
    void deleteOldLogsWithDate(@Param("dateLimit") LocalDateTime dateLimit);
}