package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AMLTransaction;
import org.example.stage_atb.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AMLTransactionRepository extends JpaRepository<AMLTransaction, String> {

    List<AMLTransaction> findByClientId(String clientId);

    List<AMLTransaction> findBySuspiciousTrue();

    @Query("SELECT aml FROM AMLTransaction aml WHERE aml.suspicious = false AND aml.amount > :threshold")
    List<AMLTransaction> findHighValueTransactions(@Param("threshold") BigDecimal threshold);

    @Query("SELECT aml FROM AMLTransaction aml WHERE aml.transactionDate BETWEEN :startDate AND :endDate")
    List<AMLTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT aml FROM AMLTransaction aml WHERE aml.flaggedForReview = true AND aml.reviewed = false")
    List<AMLTransaction> findPendingReviewTransactions();

    @Query("SELECT aml FROM AMLTransaction aml WHERE aml.transactionType = :type")
    List<AMLTransaction> findByTransactionType(@Param("type") TransactionType type);

    @Query("SELECT COUNT(aml) FROM AMLTransaction aml WHERE aml.suspicious = true")
    long countSuspiciousTransactions();
}