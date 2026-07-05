package org.example.stage_atb.Service;

import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;

import java.math.BigDecimal;
import java.util.Optional;

public interface ICreditSimulationService {

    CreditSimulation createSimulationFromCreditRequest(CreditRequest creditRequest, User user);

    BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal interestRate, Integer durationMonths);

    BigDecimal calculateDebtRatio(BigDecimal monthlyPayment, BigDecimal monthlyIncome);

    BigDecimal calculateBorrowingCapacity(BigDecimal monthlyIncome);

    // ✅ Nouvelle méthode
    Optional<CreditSimulation> getSimulationByCreditRequestId(String creditRequestId);
}