// Controller/AIForecastController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAIForecastService;
import org.example.stage_atb.dto.request.ForecastRequest;
import org.example.stage_atb.dto.response.ForecastResponse;
import org.example.stage_atb.dto.response.ScenarioSimulationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/ai/forecast")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class AIForecastController {

    private final IAIForecastService forecastService;

    /**
     * Générer des prévisions
     */
    @PostMapping("/generate")
    public ResponseEntity<ForecastResponse> generateForecast(@RequestBody ForecastRequest request) {
        log.info("POST /api/manager/ai/forecast/generate - metric: {}, period: {}",
                request.getMetric(), request.getPeriod());
        return ResponseEntity.ok(forecastService.generateForecast(request));
    }

    /**
     * Récupérer les prévisions existantes
     */
    @GetMapping("/list")
    public ResponseEntity<List<ForecastResponse>> getForecasts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/manager/ai/forecast/list - limit: {}", limit);
        return ResponseEntity.ok(forecastService.getForecasts(limit));
    }

    /**
     * Récupérer une prévision par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ForecastResponse> getForecast(@PathVariable String id) {
        log.info("GET /api/manager/ai/forecast/{}", id);
        return ResponseEntity.ok(forecastService.getForecast(id));
    }

    /**
     * Simuler des scénarios
     */
    @PostMapping("/scenarios")
    public ResponseEntity<List<ScenarioSimulationDTO>> simulateScenarios(
            @RequestBody Map<String, Double> parameters) {
        log.info("POST /api/manager/ai/forecast/scenarios - parameters: {}", parameters);
        return ResponseEntity.ok(forecastService.simulateScenarios(parameters));
    }
}