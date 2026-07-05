package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.enums.CreditStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ICreditRequestService {

    CreditResponseDTO createCreditRequest(CreditRequestDTO creditRequestDTO);

    CreditResponseDTO getCreditRequestById(String id);

    CreditResponseDTO getCreditRequestByNumber(String requestNumber);

    List<CreditResponseDTO> getCreditRequestsByClient(String clientId);

    List<CreditResponseDTO> getCreditRequestsByUser(String userId);

    List<CreditResponseDTO> getCreditRequestsByStatus(CreditStatus status);

    List<CreditResponseDTO> getAllCreditRequests();

    CreditResponseDTO updateCreditRequest(String id, CreditRequestDTO creditRequestDTO);

    CreditResponseDTO updateCreditRequestStatus(String id, CreditStatus status, String reason);

    CreditResponseDTO approveCreditRequest(String id);

    CreditResponseDTO rejectCreditRequest(String id, String reason);

    void deleteCreditRequest(String id);

    BigDecimal getTotalAmountByStatus(CreditStatus status);

    long countByStatusSince(CreditStatus status, LocalDateTime since);

    List<Object[]> getStatusDistribution();

    List<CreditResponseDTO> getHighRiskCreditRequests();

    /**
     * ✅ Récupérer les crédits d'un client par email
     */
    List<CreditResponseDTO> getCreditRequestsByClientEmail(String email);

    /**
     * ✅ Récupérer les crédits d'un client par email et statut
     */
    List<CreditResponseDTO> getCreditRequestsByClientEmailAndStatus(String email, CreditStatus status);

    /**
     * ✅ Compter les crédits d'un client par email
     */
    long countCreditRequestsByClientEmail(String email);

    /**
     * ✅ Récupérer une demande de crédit par ID (entité)
     */
    CreditRequest getCreditRequestEntityById(String id);
}