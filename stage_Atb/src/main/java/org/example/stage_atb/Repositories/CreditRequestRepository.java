package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.enums.CreditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditRequestRepository extends JpaRepository<CreditRequest, String> {

    Optional<CreditRequest> findByRequestNumber(String requestNumber);

    List<CreditRequest> findByClientId(String clientId);

    List<CreditRequest> findByUserId(String userId);

    List<CreditRequest> findByStatus(CreditStatus status);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.client.id = :clientId AND cr.status IN :statuses")
    List<CreditRequest> findByClientIdAndStatuses(@Param("clientId") String clientId, @Param("statuses") List<CreditStatus> statuses);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findByStatusAndDateRange(@Param("status") CreditStatus status,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(cr.amount) FROM CreditRequest cr WHERE cr.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") CreditStatus status);

    @Query("SELECT SUM(cr.amount) FROM CreditRequest cr WHERE cr.status IN :statuses")
    BigDecimal sumAmountByStatuses(@Param("statuses") List<CreditStatus> statuses);

    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.status = :status AND cr.createdAt > :since")
    long countByStatusSince(@Param("status") CreditStatus status, @Param("since") LocalDateTime since);

    @Query("SELECT cr.status, COUNT(cr) FROM CreditRequest cr GROUP BY cr.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT cr.status, SUM(cr.amount) FROM CreditRequest cr GROUP BY cr.status")
    List<Object[]> sumAmountByStatusGrouped();

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.amount BETWEEN :minAmount AND :maxAmount")
    List<CreditRequest> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.user.id = :userId")
    long countByUserId(@Param("userId") String userId);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status IN :statuses ORDER BY cr.createdAt DESC")
    List<CreditRequest> findLatestByStatuses(@Param("statuses") List<CreditStatus> statuses);

    /**
     * ✅ Compter les crédits par ID client
     */
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.client.id = :clientId")
    long countByClientId(@Param("clientId") String clientId);

}