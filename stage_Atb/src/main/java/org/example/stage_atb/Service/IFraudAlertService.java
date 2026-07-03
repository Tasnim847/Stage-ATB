package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.FraudAlertRequestDTO;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.enums.RiskLevel;

import java.util.List;

public interface IFraudAlertService {

    FraudAlertResponseDTO createFraudAlert(FraudAlertRequestDTO fraudAlertRequestDTO);

    FraudAlertResponseDTO getFraudAlertById(String id);

    List<FraudAlertResponseDTO> getFraudAlertsByClient(String clientId);

    List<FraudAlertResponseDTO> getFraudAlertsByCreditRequest(String creditRequestId);

    List<FraudAlertResponseDTO> getFraudAlertsBySeverity(RiskLevel severity);

    List<FraudAlertResponseDTO> getAllFraudAlerts();

    FraudAlertResponseDTO updateFraudAlert(String id, FraudAlertRequestDTO fraudAlertRequestDTO);

    void deleteFraudAlert(String id);

    FraudAlertResponseDTO reviewFraudAlert(String id);

    FraudAlertResponseDTO confirmFraudAlert(String id);

    FraudAlertResponseDTO takeAction(String id, String actionNotes);

    List<FraudAlertResponseDTO> getUnreviewedAlerts();

    List<FraudAlertResponseDTO> getConfirmedUnresolvedAlerts();

    FraudAlertResponseDTO detectFraudWithAI(String creditRequestId);
}