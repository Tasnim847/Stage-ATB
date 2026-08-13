// Service/IAIForecastService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.ForecastRequest;
import org.example.stage_atb.dto.response.ForecastResponse;
import org.example.stage_atb.dto.response.ScenarioSimulationDTO;

import java.util.List;
import java.util.Map;

public interface IAIForecastService {

    /**
     * Générer des prévisions
     */
    ForecastResponse generateForecast(ForecastRequest request);

    /**
     * Récupérer les prévisions existantes
     */
    List<ForecastResponse> getForecasts(int limit);

    /**
     * Récupérer une prévision par ID
     */
    ForecastResponse getForecast(String id);

    /**
     * Simuler des scénarios
     */
    List<ScenarioSimulationDTO> simulateScenarios(Map<String, Double> parameters);
}