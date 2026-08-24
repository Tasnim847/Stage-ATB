// Service/IManagerReportService.java
package org.example.stage_atb.Service;

public interface IManagerReportService {

    /**
     * Génère un rapport détaillé
     */
    byte[] generateDetailedReport(String period, String segment);

    /**
     * Génère un rapport stratégique
     */
    byte[] generateStrategyReport();

    /**
     * Génère un rapport d'analyse de portefeuille
     */
    byte[] generatePortfolioAnalysisReport(Integer year, String format);

    /**
     * Génère un rapport de performance des analystes
     */
    byte[] generateAnalystPerformanceReport(Integer year, String analystId);
}