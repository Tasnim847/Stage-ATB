// Service/IAIFraudService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.dto.response.FraudStatisticsDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface IAIFraudService {

    /**
     * Récupérer les alertes de fraude
     */
    List<FraudAlertResponseDTO> getFraudAlerts(String status, String severity);

    /**
     * Récupérer une alerte par ID
     */
    FraudAlertResponseDTO getFraudAlert(String id);

    /**
     * Mettre à jour le statut d'une alerte
     */
    FraudAlertResponseDTO updateFraudAlertStatus(String id, String status, String comments);

    /**
     * Récupérer les statistiques de fraude
     */
    FraudStatisticsDTO getFraudStatistics();

    /**
     * Générer un rapport de fraude
     */
    String generateFraudReport(LocalDateTime startDate, LocalDateTime endDate);
}