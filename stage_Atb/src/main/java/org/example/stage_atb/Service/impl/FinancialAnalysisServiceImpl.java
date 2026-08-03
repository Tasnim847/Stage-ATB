// FinancialAnalysisServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.FinancialAnalysisMapper;
import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.request.RatioCalculationRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.dto.response.RatioCalculationResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FinancialAnalysis;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.FinancialAnalysisRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IFinancialAnalysisService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialAnalysisServiceImpl implements IFinancialAnalysisService {

    private final FinancialAnalysisRepository analysisRepository;
    private final ClientRepository clientRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;
    private final FinancialAnalysisMapper mapper;

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);

    // ============================================
    // ✅ IMPLÉMENTATION DE calculateRatios
    // ============================================
    @Override
    public RatioCalculationResponseDTO calculateRatios(RatioCalculationRequestDTO request) {
        log.info("Calculating ratios for client: {}", request.getClientId());

        // Récupérer le client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        // Calcul du revenu total mensuel
        BigDecimal totalMonthlyIncome = request.getMonthlyNetIncome()
                .add(request.getOtherMonthlyIncome() != null ? request.getOtherMonthlyIncome() : BigDecimal.ZERO);

        // Calcul de la nouvelle mensualité
        BigDecimal newMonthlyPayment = calculateMonthlyPayment(
                request.getCreditAmount(),
                request.getAnnualInterestRate(),
                request.getDurationMonths()
        );

        // 1. Taux d'endettement
        BigDecimal debtRatio = calculateDebtRatio(totalMonthlyIncome,
                request.getExistingCreditPayments(), newMonthlyPayment);

        // 2. Capacité de remboursement
        BigDecimal repaymentCapacity = calculateRepaymentCapacity(totalMonthlyIncome,
                request.getMonthlyCharges(), request.getExistingCreditPayments());

        // 3. Revenu résiduel
        BigDecimal residualIncome = totalMonthlyIncome
                .subtract(request.getMonthlyCharges())
                .subtract(request.getExistingCreditPayments())
                .subtract(newMonthlyPayment);

        // 4. Ratio mensualité/revenu
        BigDecimal monthlyPaymentRatio = BigDecimal.ZERO;
        if (totalMonthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            monthlyPaymentRatio = newMonthlyPayment
                    .divide(totalMonthlyIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 5. Ratio charges/revenus
        BigDecimal chargesToIncomeRatio = BigDecimal.ZERO;
        if (totalMonthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            chargesToIncomeRatio = request.getMonthlyCharges()
                    .divide(totalMonthlyIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 6. Loan-to-Income (LTI)
        BigDecimal lti = BigDecimal.ZERO;
        BigDecimal annualIncome = totalMonthlyIncome.multiply(BigDecimal.valueOf(12));
        if (annualIncome.compareTo(BigDecimal.ZERO) > 0) {
            lti = request.getCreditAmount()
                    .divide(annualIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 7. Loan-to-Value (LTV)
        BigDecimal ltv = calculateLTV(request.getCreditAmount(), request.getCollateralValue());

        // 8. Ratio de couverture de la garantie
        BigDecimal coverageRatio = BigDecimal.ZERO;
        if (request.getCreditAmount().compareTo(BigDecimal.ZERO) > 0 &&
                request.getCollateralValue() != null) {
            coverageRatio = request.getCollateralValue()
                    .divide(request.getCreditAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 9. Ratio revenu/mensualité
        BigDecimal incomeToPaymentRatio = BigDecimal.ZERO;
        if (newMonthlyPayment.compareTo(BigDecimal.ZERO) > 0) {
            incomeToPaymentRatio = totalMonthlyIncome
                    .divide(newMonthlyPayment, 2, RoundingMode.HALF_UP);
        }

        // 10-14. Ratios professionnels
        BigDecimal currentRatio = null;
        BigDecimal solvencyRatio = null;
        BigDecimal financialAutonomyRatio = null;
        BigDecimal debtToAssetRatio = null;
        BigDecimal interestCoverageRatio = null;
        BigDecimal dscr = null;

        if (request.getCurrentAssets() != null && request.getCurrentLiabilities() != null
                && request.getCurrentLiabilities().compareTo(BigDecimal.ZERO) > 0) {
            currentRatio = request.getCurrentAssets()
                    .divide(request.getCurrentLiabilities(), 2, RoundingMode.HALF_UP);
        }

        if (request.getTotalAssets() != null && request.getTotalLiabilities() != null) {
            BigDecimal equity = request.getTotalAssets().subtract(request.getTotalLiabilities());
            if (request.getTotalAssets().compareTo(BigDecimal.ZERO) > 0) {
                solvencyRatio = equity
                        .divide(request.getTotalAssets(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            if (request.getTotalLiabilities().compareTo(BigDecimal.ZERO) > 0) {
                financialAutonomyRatio = equity
                        .divide(request.getTotalLiabilities(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            if (request.getTotalAssets().compareTo(BigDecimal.ZERO) > 0) {
                debtToAssetRatio = request.getTotalLiabilities()
                        .divide(request.getTotalAssets(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }

        if (request.getEbit() != null && request.getFinancialCharges() != null
                && request.getFinancialCharges().compareTo(BigDecimal.ZERO) > 0) {
            interestCoverageRatio = request.getEbit()
                    .divide(request.getFinancialCharges(), 2, RoundingMode.HALF_UP);
        }

        if (request.getAvailableCashFlow() != null && request.getAnnualDebtService() != null
                && request.getAnnualDebtService().compareTo(BigDecimal.ZERO) > 0) {
            dscr = request.getAvailableCashFlow()
                    .divide(request.getAnnualDebtService(), 2, RoundingMode.HALF_UP);
        }

        // 15. Coût total et intérêts
        BigDecimal totalCost = newMonthlyPayment.multiply(BigDecimal.valueOf(request.getDurationMonths()));
        BigDecimal totalInterest = totalCost.subtract(request.getCreditAmount());

        // Construire la réponse
        return RatioCalculationResponseDTO.builder()
                .clientId(request.getClientId())
                .totalMonthlyIncome(totalMonthlyIncome)
                .debtRatio(debtRatio)
                .debtRatioStatus(getDebtRatioStatus(debtRatio))
                .repaymentCapacity(repaymentCapacity)
                .repaymentCapacityStatus(getRepaymentCapacityStatus(repaymentCapacity))
                .residualIncome(residualIncome)
                .residualIncomeStatus(getResidualIncomeStatus(residualIncome))
                .monthlyPaymentRatio(monthlyPaymentRatio)
                .monthlyPaymentRatioStatus(getMonthlyPaymentRatioStatus(monthlyPaymentRatio))
                .chargesToIncomeRatio(chargesToIncomeRatio)
                .lti(lti)
                .ltiStatus(getLtiStatus(lti))
                .ltv(ltv)
                .ltvStatus(getLtvStatus(ltv))
                .coverageRatio(coverageRatio)
                .incomeToPaymentRatio(incomeToPaymentRatio)
                .currentRatio(currentRatio)
                .currentRatioStatus(getCurrentRatioStatus(currentRatio))
                .solvencyRatio(solvencyRatio)
                .solvencyRatioStatus(getSolvencyRatioStatus(solvencyRatio))
                .financialAutonomyRatio(financialAutonomyRatio)
                .debtToAssetRatio(debtToAssetRatio)
                .interestCoverageRatio(interestCoverageRatio)
                .dscr(dscr)
                .dscrStatus(getDscrStatus(dscr))
                .monthlyPayment(newMonthlyPayment)
                .totalCost(totalCost)
                .totalInterest(totalInterest)
                .build();
    }

    // ============================================
    // MÉTHODES DE STATUT (HELPER)
    // ============================================

    private String getDebtRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(30)) <= 0) return "FAIBLE";
        if (value.compareTo(BigDecimal.valueOf(33)) <= 0) return "ACCEPTABLE";
        if (value.compareTo(BigDecimal.valueOf(40)) <= 0) return "ELEVE";
        return "CRITIQUE";
    }

    private String getRepaymentCapacityStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1500)) >= 0) return "TRES_BONNE";
        if (value.compareTo(BigDecimal.valueOf(1000)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(500)) >= 0) return "MOYENNE";
        return "FAIBLE";
    }

    private String getResidualIncomeStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1500)) >= 0) return "SUFFISANT";
        if (value.compareTo(BigDecimal.valueOf(500)) >= 0) return "ACCEPTABLE";
        return "INSUFFISANT";
    }

    private String getMonthlyPaymentRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(30)) <= 0) return "BON";
        if (value.compareTo(BigDecimal.valueOf(40)) <= 0) return "MOYEN";
        return "ELEVE";
    }

    private String getLtiStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(300)) <= 0) return "BON";
        if (value.compareTo(BigDecimal.valueOf(500)) <= 0) return "ACCEPTABLE";
        return "ELEVE";
    }

    private String getLtvStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(70)) <= 0) return "FAIBLE_RISQUE";
        if (value.compareTo(BigDecimal.valueOf(80)) <= 0) return "MODERE";
        if (value.compareTo(BigDecimal.valueOf(90)) <= 0) return "ELEVE";
        return "TRES_ELEVE";
    }

    private String getCurrentRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1.5)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(1.0)) >= 0) return "ACCEPTABLE";
        return "RISQUE";
    }

    private String getSolvencyRatioStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(40)) >= 0) return "BONNE";
        if (value.compareTo(BigDecimal.valueOf(25)) >= 0) return "ACCEPTABLE";
        return "FAIBLE";
    }

    private String getDscrStatus(BigDecimal value) {
        if (value == null) return "UNKNOWN";
        if (value.compareTo(BigDecimal.valueOf(1.5)) >= 0) return "TRES_BON";
        if (value.compareTo(BigDecimal.valueOf(1.2)) >= 0) return "ACCEPTABLE";
        if (value.compareTo(BigDecimal.valueOf(1.0)) >= 0) return "FRAGILE";
        return "INSUFFISANT";
    }

    // ============================================
    // MÉTHODES DE CALCUL EXISTANTES
    // ============================================

    @Override
    public BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal annualRate, Integer months) {
        if (amount == null || annualRate == null || months == null || months <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthlyRate = annualRate
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);

        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return amount.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        }

        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal pow = onePlusR.pow(months);

        BigDecimal numerator = amount.multiply(monthlyRate).multiply(pow);
        BigDecimal denominator = pow.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateDebtRatio(BigDecimal totalMonthlyIncome,
                                         BigDecimal existingPayments,
                                         BigDecimal newPayment) {
        if (totalMonthlyIncome == null || totalMonthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalPayments = existingPayments.add(newPayment);
        return totalPayments
                .divide(totalMonthlyIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    @Override
    public BigDecimal calculateRepaymentCapacity(BigDecimal totalMonthlyIncome,
                                                 BigDecimal charges,
                                                 BigDecimal existingPayments) {
        if (totalMonthlyIncome == null) {
            return BigDecimal.ZERO;
        }
        return totalMonthlyIncome
                .subtract(charges != null ? charges : BigDecimal.ZERO)
                .subtract(existingPayments != null ? existingPayments : BigDecimal.ZERO);
    }

    @Override
    public BigDecimal calculateLTV(BigDecimal creditAmount, BigDecimal collateralValue) {
        if (creditAmount == null || collateralValue == null
                || collateralValue.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return creditAmount
                .divide(collateralValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    @Override
    public BigDecimal calculateDSCR(BigDecimal cashFlow, BigDecimal annualDebtService) {
        if (cashFlow == null || annualDebtService == null
                || annualDebtService.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return cashFlow.divide(annualDebtService, 2, RoundingMode.HALF_UP);
    }

    // FinancialAnalysisServiceImpl.java - MODIFIER calculateAndSaveAnalysis
    @Override
    @Transactional
    public FinancialAnalysisResponseDTO calculateAndSaveAnalysis(FinancialAnalysisRequestDTO request) {
        log.info("Calculating financial analysis for client: {}", request.getClientId());

        // Récupérer les entités
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        CreditRequest creditRequest = null;
        if (request.getCreditRequestId() != null) {
            creditRequest = creditRequestRepository.findById(request.getCreditRequestId())
                    .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + request.getCreditRequestId()));
        }

        User analyst = null;
        if (request.getAnalystId() != null) {
            analyst = userRepository.findById(request.getAnalystId())
                    .orElseThrow(() -> new RuntimeException("Analyst not found with id: " + request.getAnalystId()));
        }

        // ✅ VÉRIFIER SI UNE ANALYSE EXISTE DÉJÀ
        FinancialAnalysis existingAnalysis = null;
        if (request.getCreditRequestId() != null) {
            existingAnalysis = analysisRepository.findByCreditRequestId(request.getCreditRequestId()).orElse(null);
        }

        // Si une analyse existe, la mettre à jour, sinon en créer une nouvelle
        FinancialAnalysis analysis;
        if (existingAnalysis != null) {
            log.info("Updating existing analysis for credit request: {}", request.getCreditRequestId());
            analysis = existingAnalysis;
        } else {
            log.info("Creating new analysis for credit request: {}", request.getCreditRequestId());
            analysis = FinancialAnalysis.builder()
                    .creditRequest(creditRequest)
                    .client(client)
                    .analyst(analyst)
                    .status("COMPLETED")
                    .analyzedBy(analyst != null ? analyst.getFirstName() + " " + analyst.getLastName() : "SYSTEM")
                    .build();
        }

        // Calcul du revenu total mensuel
        BigDecimal totalMonthlyIncome = request.getMonthlyNetIncome()
                .add(request.getOtherMonthlyIncome() != null ? request.getOtherMonthlyIncome() : BigDecimal.ZERO);

        // Calcul de la nouvelle mensualité
        BigDecimal newMonthlyPayment = calculateMonthlyPayment(
                request.getCreditAmount(),
                request.getAnnualInterestRate(),
                request.getDurationMonths()
        );

        // Mettre à jour les données de base
        analysis.setMonthlyNetIncome(request.getMonthlyNetIncome());
        analysis.setOtherMonthlyIncome(request.getOtherMonthlyIncome());
        analysis.setTotalMonthlyIncome(totalMonthlyIncome);
        analysis.setAnnualIncome(totalMonthlyIncome.multiply(BigDecimal.valueOf(12)));
        analysis.setMonthlyCharges(request.getMonthlyCharges());
        analysis.setExistingCreditPayments(request.getExistingCreditPayments());
        analysis.setNewMonthlyPayment(newMonthlyPayment);

        // 1. Taux d'endettement
        BigDecimal debtRatio = calculateDebtRatio(totalMonthlyIncome,
                request.getExistingCreditPayments(), newMonthlyPayment);
        analysis.setDebtRatio(debtRatio);

        // 2. Capacité de remboursement
        BigDecimal repaymentCapacity = calculateRepaymentCapacity(totalMonthlyIncome,
                request.getMonthlyCharges(), request.getExistingCreditPayments());
        analysis.setRepaymentCapacity(repaymentCapacity);

        // 3. Revenu résiduel
        BigDecimal residualIncome = totalMonthlyIncome
                .subtract(request.getMonthlyCharges())
                .subtract(request.getExistingCreditPayments())
                .subtract(newMonthlyPayment);
        analysis.setResidualIncome(residualIncome);

        // 4. Ratio mensualité/revenu
        BigDecimal monthlyPaymentRatio = BigDecimal.ZERO;
        if (totalMonthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            monthlyPaymentRatio = newMonthlyPayment
                    .divide(totalMonthlyIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        analysis.setMonthlyPaymentRatio(monthlyPaymentRatio);

        // 5. Ratio charges/revenus
        BigDecimal chargesToIncomeRatio = BigDecimal.ZERO;
        if (totalMonthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            chargesToIncomeRatio = request.getMonthlyCharges()
                    .divide(totalMonthlyIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        analysis.setChargesToIncomeRatio(chargesToIncomeRatio);

        // 6. Loan-to-Income (LTI)
        BigDecimal lti = BigDecimal.ZERO;
        BigDecimal annualIncome = totalMonthlyIncome.multiply(BigDecimal.valueOf(12));
        if (annualIncome.compareTo(BigDecimal.ZERO) > 0) {
            lti = request.getCreditAmount()
                    .divide(annualIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        analysis.setLti(lti);

        // 7. Loan-to-Value (LTV)
        BigDecimal ltv = calculateLTV(request.getCreditAmount(), request.getCollateralValue());
        analysis.setLtv(ltv);

        // 8. Ratio de couverture de la garantie
        BigDecimal coverageRatio = BigDecimal.ZERO;
        if (request.getCreditAmount().compareTo(BigDecimal.ZERO) > 0 &&
                request.getCollateralValue() != null) {
            coverageRatio = request.getCollateralValue()
                    .divide(request.getCreditAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        analysis.setCoverageRatio(coverageRatio);

        // 9. Ratio revenu/mensualité
        BigDecimal incomeToPaymentRatio = BigDecimal.ZERO;
        if (newMonthlyPayment.compareTo(BigDecimal.ZERO) > 0) {
            incomeToPaymentRatio = totalMonthlyIncome
                    .divide(newMonthlyPayment, 2, RoundingMode.HALF_UP);
        }
        analysis.setIncomeToPaymentRatio(incomeToPaymentRatio);

        // 10-15. Ratios professionnels (si disponibles)
        calculateProfessionalRatios(analysis, request);

        // 16-17. Coût total et intérêts
        BigDecimal totalCost = newMonthlyPayment.multiply(BigDecimal.valueOf(request.getDurationMonths()));
        BigDecimal totalInterest = totalCost.subtract(request.getCreditAmount());
        analysis.setTotalCost(totalCost);
        analysis.setTotalInterest(totalInterest);

        // Score global et décision
        BigDecimal overallScore = calculateOverallScore(analysis);
        analysis.setOverallScore(overallScore);
        analysis.setRiskLevel(determineRiskLevel(overallScore));
        analysis.setRecommendation(generateRecommendation(analysis));
        analysis.setFinancialHealthScore(determineFinancialHealthScore(overallScore));

        // Sauvegarder
        FinancialAnalysis saved = analysisRepository.save(analysis);

        // Mettre à jour le CreditRequest si nécessaire
        if (creditRequest != null) {
            creditRequest.setFinancialAnalysis(saved);
            creditRequestRepository.save(creditRequest);
        }

        return mapper.toResponseDTO(saved);
    }

    private void calculateProfessionalRatios(FinancialAnalysis analysis, FinancialAnalysisRequestDTO request) {
        // 10. Ratio de liquidité générale
        if (request.getCurrentAssets() != null && request.getCurrentLiabilities() != null
                && request.getCurrentLiabilities().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentRatio = request.getCurrentAssets()
                    .divide(request.getCurrentLiabilities(), 2, RoundingMode.HALF_UP);
            analysis.setCurrentRatio(currentRatio);
        }

        // 11. Ratio de solvabilité
        if (request.getTotalAssets() != null && request.getTotalLiabilities() != null) {
            BigDecimal equity = request.getTotalAssets().subtract(request.getTotalLiabilities());
            if (request.getTotalAssets().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal solvencyRatio = equity
                        .divide(request.getTotalAssets(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                analysis.setSolvencyRatio(solvencyRatio);
            }

            // 12. Ratio d'autonomie financière
            if (request.getTotalLiabilities().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal autonomyRatio = equity
                        .divide(request.getTotalLiabilities(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                analysis.setFinancialAutonomyRatio(autonomyRatio);
            }

            // 13. Debt-to-Asset Ratio
            if (request.getTotalAssets().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal debtToAsset = request.getTotalLiabilities()
                        .divide(request.getTotalAssets(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                analysis.setDebtToAssetRatio(debtToAsset);
            }
        }

        // 14. Ratio de couverture des intérêts
        if (request.getEbit() != null && request.getFinancialCharges() != null
                && request.getFinancialCharges().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal interestCoverage = request.getEbit()
                    .divide(request.getFinancialCharges(), 2, RoundingMode.HALF_UP);
            analysis.setInterestCoverageRatio(interestCoverage);
        }

        // 15. DSCR
        if (request.getAvailableCashFlow() != null && request.getAnnualDebtService() != null
                && request.getAnnualDebtService().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal dscr = request.getAvailableCashFlow()
                    .divide(request.getAnnualDebtService(), 2, RoundingMode.HALF_UP);
            analysis.setDscr(dscr);
        }
    }

    private BigDecimal calculateOverallScore(FinancialAnalysis analysis) {
        // Score d'endettement (30%)
        BigDecimal debtScore = calculateDebtScore(analysis.getDebtRatio());

        // Score capacité de remboursement (25%)
        BigDecimal capacityScore = calculateCapacityScore(analysis.getRepaymentCapacity());

        // Score revenu résiduel (15%)
        BigDecimal residualScore = calculateResidualScore(analysis.getResidualIncome());

        // Score historique de paiement (15%)
        BigDecimal paymentScore = calculatePaymentScore(analysis);

        // Score garanties (15%)
        BigDecimal guaranteeScore = calculateGuaranteeScore(analysis.getLtv());

        BigDecimal overall = debtScore.multiply(BigDecimal.valueOf(0.30))
                .add(capacityScore.multiply(BigDecimal.valueOf(0.25)))
                .add(residualScore.multiply(BigDecimal.valueOf(0.15)))
                .add(paymentScore.multiply(BigDecimal.valueOf(0.15)))
                .add(guaranteeScore.multiply(BigDecimal.valueOf(0.15)));

        return overall.setScale(0, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateDebtScore(BigDecimal debtRatio) {
        if (debtRatio == null) return BigDecimal.valueOf(50);

        if (debtRatio.compareTo(BigDecimal.valueOf(30)) <= 0) return BigDecimal.valueOf(100);
        if (debtRatio.compareTo(BigDecimal.valueOf(33)) <= 0) return BigDecimal.valueOf(85);
        if (debtRatio.compareTo(BigDecimal.valueOf(40)) <= 0) return BigDecimal.valueOf(60);
        if (debtRatio.compareTo(BigDecimal.valueOf(50)) <= 0) return BigDecimal.valueOf(30);
        return BigDecimal.valueOf(10);
    }

    private BigDecimal calculateCapacityScore(BigDecimal capacity) {
        if (capacity == null) return BigDecimal.valueOf(50);

        if (capacity.compareTo(BigDecimal.valueOf(2000)) >= 0) return BigDecimal.valueOf(100);
        if (capacity.compareTo(BigDecimal.valueOf(1500)) >= 0) return BigDecimal.valueOf(85);
        if (capacity.compareTo(BigDecimal.valueOf(1000)) >= 0) return BigDecimal.valueOf(65);
        if (capacity.compareTo(BigDecimal.valueOf(500)) >= 0) return BigDecimal.valueOf(40);
        return BigDecimal.valueOf(20);
    }

    private BigDecimal calculateResidualScore(BigDecimal residual) {
        if (residual == null) return BigDecimal.valueOf(50);

        if (residual.compareTo(BigDecimal.valueOf(1500)) >= 0) return BigDecimal.valueOf(100);
        if (residual.compareTo(BigDecimal.valueOf(1000)) >= 0) return BigDecimal.valueOf(80);
        if (residual.compareTo(BigDecimal.valueOf(500)) >= 0) return BigDecimal.valueOf(55);
        if (residual.compareTo(BigDecimal.valueOf(200)) >= 0) return BigDecimal.valueOf(30);
        return BigDecimal.valueOf(10);
    }

    private BigDecimal calculatePaymentScore(FinancialAnalysis analysis) {
        // Simulé - en production, on utiliserait l'historique réel
        return BigDecimal.valueOf(80);
    }

    private BigDecimal calculateGuaranteeScore(BigDecimal ltv) {
        if (ltv == null) return BigDecimal.valueOf(50);

        if (ltv.compareTo(BigDecimal.valueOf(70)) <= 0) return BigDecimal.valueOf(100);
        if (ltv.compareTo(BigDecimal.valueOf(80)) <= 0) return BigDecimal.valueOf(80);
        if (ltv.compareTo(BigDecimal.valueOf(90)) <= 0) return BigDecimal.valueOf(50);
        return BigDecimal.valueOf(20);
    }

    private String determineRiskLevel(BigDecimal score) {
        if (score == null) return "UNKNOWN";

        int scoreValue = score.intValue();
        if (scoreValue >= 85) return "VERY_LOW";
        if (scoreValue >= 70) return "LOW";
        if (scoreValue >= 50) return "MEDIUM";
        if (scoreValue >= 30) return "HIGH";
        return "VERY_HIGH";
    }

    private String determineFinancialHealthScore(BigDecimal score) {
        if (score == null) return "UNKNOWN";

        int scoreValue = score.intValue();
        if (scoreValue >= 85) return "EXCELLENT";
        if (scoreValue >= 70) return "GOOD";
        if (scoreValue >= 50) return "FAIR";
        if (scoreValue >= 30) return "POOR";
        return "VERY_POOR";
    }

    private String generateRecommendation(FinancialAnalysis analysis) {
        StringBuilder recommendation = new StringBuilder();

        if (analysis.getDebtRatio().compareTo(BigDecimal.valueOf(33)) <= 0) {
            recommendation.append("Taux d'endettement favorable. ");
        } else if (analysis.getDebtRatio().compareTo(BigDecimal.valueOf(40)) <= 0) {
            recommendation.append("Taux d'endettement à surveiller. ");
        } else {
            recommendation.append("Taux d'endettement élevé à réduire. ");
        }

        if (analysis.getRepaymentCapacity().compareTo(BigDecimal.valueOf(1000)) >= 0) {
            recommendation.append("Bonne capacité de remboursement. ");
        } else {
            recommendation.append("Capacité de remboursement limitée. ");
        }

        if (analysis.getLtv() != null && analysis.getLtv().compareTo(BigDecimal.valueOf(80)) <= 0) {
            recommendation.append("Couverture garantie satisfaisante. ");
        } else if (analysis.getLtv() != null && analysis.getLtv().compareTo(BigDecimal.valueOf(90)) <= 0) {
            recommendation.append("Couverture garantie à renforcer. ");
        }

        return recommendation.toString();
    }

    @Override
    @Transactional
    public FinancialAnalysisResponseDTO approveAnalysis(String id, String analystId) {
        log.info("Approving analysis: {} by analyst: {}", id, analystId);

        FinancialAnalysis analysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));

        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new RuntimeException("Analyst not found with id: " + analystId));

        analysis.setApprovedByAnalyst(true);
        analysis.setStatus("APPROVED");
        analysis.setAnalyzedBy(analyst.getFirstName() + " " + analyst.getLastName());
        analysis.setUpdatedAt(LocalDateTime.now());

        FinancialAnalysis saved = analysisRepository.save(analysis);
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public FinancialAnalysisResponseDTO rejectAnalysis(String id, String analystId, String reason) {
        log.info("Rejecting analysis: {} by analyst: {}, reason: {}", id, analystId, reason);

        FinancialAnalysis analysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));

        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new RuntimeException("Analyst not found with id: " + analystId));

        analysis.setApprovedByAnalyst(false);
        analysis.setStatus("REJECTED");
        analysis.setAnalyzedBy(analyst.getFirstName() + " " + analyst.getLastName());
        analysis.setRecommendation("Rejected: " + (reason != null ? reason : "No reason provided"));
        analysis.setUpdatedAt(LocalDateTime.now());

        FinancialAnalysis saved = analysisRepository.save(analysis);
        return mapper.toResponseDTO(saved);
    }


    @Override
    public FinancialAnalysisResponseDTO getAnalysisById(String id) {
        FinancialAnalysis analysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));
        return mapper.toResponseDTO(analysis);
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getAnalysesByClient(String clientId) {
        return analysisRepository.findByClientId(clientId).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getAnalysesByCreditRequest(String creditRequestId) {
        return analysisRepository.findByCreditRequestId(creditRequestId).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getAllAnalyses() {
        return analysisRepository.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FinancialAnalysisResponseDTO> getAnalysesByAnalyst(String analystId) {
        return analysisRepository.findByAnalystId(analystId).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FinancialAnalysisResponseDTO updateAnalysis(String id, FinancialAnalysisRequestDTO request) {
        FinancialAnalysis existing = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));

        // Mettre à jour avec les nouvelles données
        mapper.updateEntity(existing, request);

        // Recalculer l'analyse
        FinancialAnalysis saved = analysisRepository.save(existing);
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAnalysis(String id) {
        if (!analysisRepository.existsById(id)) {
            throw new RuntimeException("Analysis not found with id: " + id);
        }
        analysisRepository.deleteById(id);
    }
}