package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.LoanPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LoanPortfolioRepository extends JpaRepository<LoanPortfolio, String> {

    @Query("SELECT lp FROM LoanPortfolio lp WHERE lp.defaultRate >= :maxRate")
    List<LoanPortfolio> findHighDefaultRatePortfolios(@Param("maxRate") BigDecimal maxRate);

    @Query("SELECT lp FROM LoanPortfolio lp WHERE lp.profitabilityRate >= :minRate")
    List<LoanPortfolio> findHighProfitabilityPortfolios(@Param("minRate") BigDecimal minRate);

    @Query("SELECT lp FROM LoanPortfolio lp ORDER BY lp.totalAmount DESC")
    List<LoanPortfolio> findLargestPortfolios();

    @Query("SELECT SUM(lp.totalAmount) FROM LoanPortfolio lp")
    BigDecimal sumTotalAmount();

    @Query("SELECT AVG(lp.defaultRate) FROM LoanPortfolio lp")
    Double averageDefaultRate();
}