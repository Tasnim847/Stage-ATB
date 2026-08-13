// Service/impl/AIForecastServiceImpl.java - CORRIGÉ
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Service.IAIForecastService;
import org.example.stage_atb.dto.request.ForecastRequest;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.enums.CreditStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AIForecastServiceImpl implements IAIForecastService {

    private final CreditRequestRepository creditRequestRepository;

    @Override
    public ForecastResponse generateForecast(ForecastRequest request) {
        log.info("🔮 Génération des prévisions pour la métrique: {}, période: {}",
                request.getMetric(), request.getPeriod());

        List<CreditRequest> historicalData = getHistoricalData();

        double currentValue = calculateCurrentValue(historicalData, request.getMetric());

        List<ForecastValueDTO> forecastValues = generateForecastValues(
                currentValue, request.getPeriod(), request.getMetric()
        );

        ConfidenceIntervalDTO confidenceInterval = calculateConfidenceInterval(
                forecastValues, request.getConfidenceLevel()
        );

        String trend = determineTrend(forecastValues);

        List<String> recommendations = generateRecommendations(forecastValues, trend, request.getMetric());

        return ForecastResponse.builder()
                .id(UUID.randomUUID().toString())
                .date(LocalDateTime.now())
                .metric(request.getMetric())
                .currentValue(currentValue)
                .forecastValues(forecastValues)
                .confidenceInterval(confidenceInterval)
                .trend(trend)
                .seasonality(getSeasonalityPatterns(request.getPeriod()))
                .recommendations(recommendations)
                .build();
    }

    @Override
    public List<ForecastResponse> getForecasts(int limit) {
        log.info("📋 Récupération des {} dernières prévisions", limit);

        List<ForecastResponse> forecasts = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 5); i++) {
            forecasts.add(generateMockForecast(i));
        }
        return forecasts;
    }

    @Override
    public ForecastResponse getForecast(String id) {
        log.info("📋 Récupération de la prévision: {}", id);
        return generateMockForecast(0);
    }

    @Override
    public List<ScenarioSimulationDTO> simulateScenarios(Map<String, Double> parameters) {
        log.info("🎯 Simulation de scénarios avec paramètres: {}", parameters);

        List<ScenarioSimulationDTO> scenarios = new ArrayList<>();

        scenarios.add(createScenario(
                "Optimiste",
                "Croissance économique forte, taux d'intérêt bas",
                "LOW",
                85,
                parameters
        ));

        scenarios.add(createScenario(
                "De base",
                "Croissance modérée, taux d'intérêt stables",
                "MODERATE",
                60,
                parameters
        ));

        scenarios.add(createScenario(
                "Pessimiste",
                "Ralentissement économique, taux d'intérêt élevés",
                "HIGH",
                35,
                parameters
        ));

        scenarios.add(createScenario(
                "Critique",
                "Récession économique, taux d'intérêt très élevés",
                "CRITICAL",
                15,
                parameters
        ));

        return scenarios;
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private List<CreditRequest> getHistoricalData() {
        return creditRequestRepository.findByDateRange(
                LocalDateTime.now().minusMonths(6),
                LocalDateTime.now()
        );
    }

    private double calculateCurrentValue(List<CreditRequest> data, String metric) {
        if (data.isEmpty()) return 50 + new Random().nextDouble() * 30;

        return switch (metric) {
            case "approval_rate" -> calculateApprovalRate(data);
            case "volume" -> data.size();
            case "risk_score" -> calculateAverageRiskScore(data);
            case "default_rate" -> calculateDefaultRate(data);
            default -> 50 + new Random().nextDouble() * 30;
        };
    }

    private double calculateApprovalRate(List<CreditRequest> data) {
        long total = data.size();
        if (total == 0) return 0;
        long approved = data.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                .count();
        return (double) approved / total * 100;
    }

    private double calculateAverageRiskScore(List<CreditRequest> data) {
        return data.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null)
                .mapToDouble(r -> r.getRiskAnalysis().getRiskScore().doubleValue())
                .average()
                .orElse(50);
    }

    private double calculateDefaultRate(List<CreditRequest> data) {
        long total = data.size();
        if (total == 0) return 0;
        long defaulted = data.stream()
                .filter(r -> r.getStatus() == CreditStatus.REJECTED)
                .count();
        return (double) defaulted / total * 100;
    }

    private List<ForecastValueDTO> generateForecastValues(double currentValue, String period, String metric) {
        List<ForecastValueDTO> values = new ArrayList<>();
        Random random = new Random();

        int periods = switch (period) {
            case "month" -> 6;
            case "quarter" -> 4;
            case "year" -> 12;
            default -> 6;
        };

        double baseValue = currentValue;
        double trend = (random.nextDouble() - 0.4) * 5;

        for (int i = 1; i <= periods; i++) {
            String label = getPeriodLabel(i, period);
            double noise = (random.nextDouble() - 0.5) * 4;
            double value = baseValue + (trend * i) + noise;
            if (metric.equals("approval_rate") || metric.equals("default_rate")) {
                value = Math.max(0, Math.min(100, value));
            }
            double lowerBound = value - 5 - random.nextDouble() * 3;
            double upperBound = value + 5 + random.nextDouble() * 3;

            values.add(ForecastValueDTO.builder()
                    .period(label)
                    .value(Math.round(value * 100) / 100.0)
                    .lowerBound(Math.round(lowerBound * 100) / 100.0)
                    .upperBound(Math.round(upperBound * 100) / 100.0)
                    .build());
        }
        return values;
    }

    private String getPeriodLabel(int index, String period) {
        LocalDateTime date = LocalDateTime.now().plusMonths(index);
        return switch (period) {
            case "month" -> date.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            case "quarter" -> "T" + ((index - 1) / 3 + 1) + " " + date.getYear();
            case "year" -> String.valueOf(date.getYear());
            default -> date.format(DateTimeFormatter.ofPattern("MMM yyyy"));
        };
    }

    // ✅ CORRECTION: Utiliser Double.valueOf() au lieu de int
    private ConfidenceIntervalDTO calculateConfidenceInterval(List<ForecastValueDTO> values, Integer confidenceLevel) {
        if (values.isEmpty()) {
            return ConfidenceIntervalDTO.builder()
                    .lower(0.0)  // ✅ Utiliser Double
                    .upper(0.0)  // ✅ Utiliser Double
                    .level(confidenceLevel != null ? confidenceLevel : 95)
                    .build();
        }

        double avg = values.stream().mapToDouble(ForecastValueDTO::getValue).average().orElse(0);
        double lower = values.stream().mapToDouble(ForecastValueDTO::getLowerBound).min().orElse(avg - 10);
        double upper = values.stream().mapToDouble(ForecastValueDTO::getUpperBound).max().orElse(avg + 10);

        return ConfidenceIntervalDTO.builder()
                .lower(Math.round(lower * 100) / 100.0)  // ✅ Double
                .upper(Math.round(upper * 100) / 100.0)  // ✅ Double
                .level(confidenceLevel != null ? confidenceLevel : 95)
                .build();
    }

    private String determineTrend(List<ForecastValueDTO> values) {
        if (values.size() < 2) return "stable";

        double first = values.get(0).getValue();
        double last = values.get(values.size() - 1).getValue();
        double diff = last - first;

        if (diff > 2) return "up";
        if (diff < -2) return "down";
        return "stable";
    }

    private List<String> getSeasonalityPatterns(String period) {
        return switch (period) {
            case "month" -> Arrays.asList("Janvier: -5%", "Février: -3%", "Mars: +2%");
            case "quarter" -> Arrays.asList("Q1: +2%", "Q2: +5%", "Q3: -2%", "Q4: +8%");
            case "year" -> Arrays.asList("Début d'année: modéré", "Milieu d'année: croissance", "Fin d'année: forte");
            default -> Arrays.asList("Pas de saisonnalité détectée");
        };
    }

    private List<String> generateRecommendations(List<ForecastValueDTO> values, String trend, String metric) {
        List<String> recommendations = new ArrayList<>();

        if ("up".equals(trend)) {
            recommendations.add("📈 Tendances positives - Maintenir la stratégie actuelle");
            recommendations.add("💡 Augmenter les ressources pour gérer la croissance");
        } else if ("down".equals(trend)) {
            recommendations.add("📉 Tendances négatives - Revoir la stratégie");
            recommendations.add("⚠️ Renforcer l'analyse des risques");
        } else {
            recommendations.add("📊 Tendances stables - Continuer les efforts actuels");
            recommendations.add("🔍 Optimiser les processus existants");
        }

        if (metric.equals("approval_rate")) {
            recommendations.add("🎯 Objectif: atteindre 75% d'approbation");
        } else if (metric.equals("risk_score")) {
            recommendations.add("🛡️ Objectif: réduire le score de risque à moins de 50");
        }

        return recommendations;
    }

    private ScenarioSimulationDTO createScenario(String name, String description,
                                                 String riskLevel, double probability,
                                                 Map<String, Double> parameters) {
        Random random = new Random();
        double baseOutcome = 50 + random.nextDouble() * 30;

        double economicGrowth = parameters.getOrDefault("economicGrowth", 2.5);
        double interestRate = parameters.getOrDefault("interestRate", 7.5);
        double unemployment = parameters.getOrDefault("unemployment", 12.0);
        double inflation = parameters.getOrDefault("inflation", 6.0);

        double impact = (economicGrowth * 0.4) - (interestRate * 0.3) - (unemployment * 0.2) - (inflation * 0.1);
        double outcome = baseOutcome + impact;

        outcome = Math.max(10, Math.min(100, outcome));

        List<ScenarioParameterDTO> params = Arrays.asList(
                ScenarioParameterDTO.builder()
                        .name("Croissance économique")
                        .value(Math.round(economicGrowth * 10) / 10.0)
                        .impact("positive")
                        .build(),
                ScenarioParameterDTO.builder()
                        .name("Taux d'intérêt")
                        .value(Math.round(interestRate * 10) / 10.0)
                        .impact("negative")
                        .build(),
                ScenarioParameterDTO.builder()
                        .name("Chômage")
                        .value(Math.round(unemployment * 10) / 10.0)
                        .impact("negative")
                        .build(),
                ScenarioParameterDTO.builder()
                        .name("Inflation")
                        .value(Math.round(inflation * 10) / 10.0)
                        .impact("negative")
                        .build()
        );

        return ScenarioSimulationDTO.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .description(description + " - Impact estimé")
                .parameters(params)
                .expectedOutcome(Math.round(outcome * 100) / 100.0)
                .probability(probability / 100.0)
                .riskLevel(riskLevel)
                .build();
    }

    private ForecastResponse generateMockForecast(int index) {
        Random random = new Random();
        String[] metrics = {"approval_rate", "volume", "risk_score", "default_rate"};
        String selectedMetric = metrics[index % metrics.length];

        List<ForecastValueDTO> values = new ArrayList<>();
        double baseValue = 50 + random.nextDouble() * 30;

        for (int i = 1; i <= 6; i++) {
            values.add(ForecastValueDTO.builder()
                    .period(LocalDateTime.now().plusMonths(i).format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .value(Math.round((baseValue + random.nextDouble() * 20) * 100) / 100.0)
                    .lowerBound(Math.round((baseValue + random.nextDouble() * 10 - 5) * 100) / 100.0)
                    .upperBound(Math.round((baseValue + random.nextDouble() * 10 + 10) * 100) / 100.0)
                    .build());
        }

        return ForecastResponse.builder()
                .id(UUID.randomUUID().toString())
                .date(LocalDateTime.now().minusDays(index * 2))
                .metric(selectedMetric)
                .currentValue(Math.round((50 + random.nextDouble() * 30) * 100) / 100.0)
                .forecastValues(values)
                .confidenceInterval(ConfidenceIntervalDTO.builder()
                        .lower(Math.round((40 + random.nextDouble() * 20) * 100) / 100.0)  // ✅ Double
                        .upper(Math.round((60 + random.nextDouble() * 20) * 100) / 100.0)  // ✅ Double
                        .level(95)
                        .build())
                .trend(random.nextBoolean() ? "up" : random.nextBoolean() ? "down" : "stable")
                .seasonality(Arrays.asList("Janvier: -5%", "Février: -3%", "Mars: +2%"))
                .recommendations(Arrays.asList(
                        "📈 Maintenir la stratégie actuelle",
                        "💡 Optimiser les processus"
                ))
                .build();
    }
}