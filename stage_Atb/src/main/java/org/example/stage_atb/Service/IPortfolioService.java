package org.example.stage_atb.Service;

import org.example.stage_atb.dto.response.PortfolioResponseDTO;

import java.util.Map;

public interface IPortfolioService {

    /**
     * Récupère le portefeuille global avec filtres
     */
    PortfolioResponseDTO getGlobalPortfolio(Integer year, String status, String type, String riskLevel, int page, int size);

    /**
     * Récupère le résumé du portefeuille
     */
    Map<String, Object> getPortfolioSummary(Integer year);

    /**
     * Récupère les données pour les graphiques
     */
    Map<String, Object> getPortfolioCharts(Integer year);

    /**
     * Récupère l'analyse des risques du portefeuille
     */
    Map<String, Object> getPortfolioRisk(Integer year);

    /**
     * Récupère les détails d'un crédit
     */
    Map<String, Object> getCreditDetails(String creditId);

    /**
     * Exporte les données du portefeuille
     */
    byte[] exportPortfolioData(Integer year);

    /**
     * Récupère les performances des analystes
     */
    Map<String, Object> getAnalystPerformance(Integer year, String analystId);

    /**
     * Récupère la répartition des dossiers entre analystes
     */
    Map<String, Object> getWorkloadDistribution();
}