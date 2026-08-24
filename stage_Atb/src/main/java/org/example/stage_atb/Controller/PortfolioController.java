package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IPortfolioService;
import org.example.stage_atb.dto.response.PortfolioResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class PortfolioController {

    private final IPortfolioService portfolioService;

    /**
     * Récupère le portefeuille global avec filtres
     */
    @GetMapping("/global")
    public ResponseEntity<PortfolioResponseDTO> getGlobalPortfolio(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("📊 Récupération du portefeuille global - year: {}, status: {}, type: {}, riskLevel: {}, page: {}, size: {}",
                year, status, type, riskLevel, page, size);

        PortfolioResponseDTO portfolio = portfolioService.getGlobalPortfolio(year, status, type, riskLevel, page, size);
        return ResponseEntity.ok(portfolio);
    }

    /**
     * Récupère le résumé du portefeuille
     */
    @GetMapping("/summary/{year}")
    public ResponseEntity<Map<String, Object>> getPortfolioSummary(@PathVariable Integer year) {
        log.info("📊 Récupération du résumé du portefeuille pour l'année: {}", year);
        Map<String, Object> summary = portfolioService.getPortfolioSummary(year);
        return ResponseEntity.ok(summary);
    }

    /**
     * Récupère les données pour les graphiques
     */
    @GetMapping("/charts/{year}")
    public ResponseEntity<Map<String, Object>> getPortfolioCharts(@PathVariable Integer year) {
        log.info("📊 Récupération des données des graphiques pour l'année: {}", year);
        Map<String, Object> charts = portfolioService.getPortfolioCharts(year);
        return ResponseEntity.ok(charts);
    }

    /**
     * Récupère l'analyse des risques du portefeuille
     */
    @GetMapping("/risk/{year}")
    public ResponseEntity<Map<String, Object>> getPortfolioRisk(@PathVariable Integer year) {
        log.info("📊 Récupération de l'analyse des risques pour l'année: {}", year);
        Map<String, Object> risk = portfolioService.getPortfolioRisk(year);
        return ResponseEntity.ok(risk);
    }

    /**
     * Récupère les détails d'un crédit
     */
    @GetMapping("/credit/{creditId}")
    public ResponseEntity<Map<String, Object>> getCreditDetails(@PathVariable String creditId) {
        log.info("🔍 Récupération des détails du crédit: {}", creditId);
        Map<String, Object> details = portfolioService.getCreditDetails(creditId);
        return ResponseEntity.ok(details);
    }

    /**
     * Exporte les données du portefeuille
     */
    @GetMapping("/export/{year}")
    public ResponseEntity<byte[]> exportPortfolioData(@PathVariable Integer year) {
        log.info("📤 Exportation des données du portefeuille pour l'année: {}", year);
        byte[] data = portfolioService.exportPortfolioData(year);
        return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=portefeuille_" + year + ".xlsx")
                .body(data);
    }

    /**
     * Récupère les performances des analystes
     */
    @GetMapping("/analysts/performance")
    public ResponseEntity<Map<String, Object>> getAnalystPerformance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String analystId) {
        log.info("📊 Récupération des performances des analystes - year: {}, analystId: {}", year, analystId);
        Map<String, Object> performance = portfolioService.getAnalystPerformance(year, analystId);
        return ResponseEntity.ok(performance);
    }

    /**
     * Récupère la répartition des dossiers entre analystes
     */
    @GetMapping("/analysts/workload")
    public ResponseEntity<Map<String, Object>> getWorkloadDistribution() {
        log.info("📊 Récupération de la répartition des dossiers");
        Map<String, Object> workload = portfolioService.getWorkloadDistribution();
        return ResponseEntity.ok(workload);
    }

    /**
     * ✅ Récupère les analyses détaillées du portefeuille (AJOUTÉ)
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getPortfolioAnalytics(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "all") String segment) {

        log.info("📊 Récupération des analyses du portefeuille - period: {}, segment: {}", period, segment);

        Map<String, Object> analytics = portfolioService.getPortfolioAnalytics(period, segment);
        return ResponseEntity.ok(analytics);
    }

    /**
     * ✅ Récupère la matrice des risques (AJOUTÉ)
     */
    @GetMapping("/risk-matrix")
    public ResponseEntity<Map<String, Object>> getPortfolioRiskMatrix(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "all") String segment) {

        log.info("📊 Récupération de la matrice des risques - period: {}, segment: {}", period, segment);

        Map<String, Object> riskMatrix = portfolioService.getPortfolioRiskMatrix(period, segment);
        return ResponseEntity.ok(riskMatrix);
    }
}