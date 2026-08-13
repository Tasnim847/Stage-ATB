// Service/IAIStrategyService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.StrategicReportRequest;
import org.example.stage_atb.dto.response.AIDecisionDTO;
import org.example.stage_atb.dto.response.StrategicReportResponse;
import org.springframework.core.io.Resource;

import java.util.List;

public interface IAIStrategyService {

    /**
     * Générer un rapport stratégique
     */
    StrategicReportResponse generateStrategicReport(StrategicReportRequest request);

    /**
     * Récupérer les rapports stratégiques
     */
    List<StrategicReportResponse> getStrategicReports(int limit);

    /**
     * Récupérer un rapport par ID
     */
    StrategicReportResponse getStrategicReport(String id);

    /**
     * Récupérer les décisions IA
     */
    List<AIDecisionDTO> getAIDecisions();

    /**
     * Exporter un rapport
     */
    Resource exportReport(String id, String format);
}