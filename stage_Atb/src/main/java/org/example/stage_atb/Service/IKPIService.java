// Service/IKPIService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.response.ManagerKPIDTO;
import org.example.stage_atb.dto.response.AnalystKPIDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface IKPIService {

    /**
     * Récupérer tous les KPIs pour le tableau de bord manager
     */
    ManagerKPIDTO getManagerKPIs();

    /**
     * Récupérer les KPIs par période
     */
    ManagerKPIDTO getKPIsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Récupérer les KPIs de performance des analystes
     */
    List<AnalystKPIDTO> getAnalystPerformanceKPIs();

    /**
     * Récupérer les KPIs de validation manager
     */
    Object getManagerValidationKPIs();
}