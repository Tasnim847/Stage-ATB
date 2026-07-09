package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.enums.CreditStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ICreditRequestService {

    // ============================================
    // CRUD DE BASE
    // ============================================

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

    // ============================================
    // STATISTIQUES
    // ============================================

    BigDecimal getTotalAmountByStatus(CreditStatus status);

    long countByStatusSince(CreditStatus status, LocalDateTime since);

    List<Object[]> getStatusDistribution();

    List<CreditResponseDTO> getHighRiskCreditRequests();

    // ============================================
    // MÉTHODES POUR CLIENT (par email)
    // ============================================

    List<CreditResponseDTO> getCreditRequestsByClientEmail(String email);

    List<CreditResponseDTO> getCreditRequestsByClientEmailAndStatus(String email, CreditStatus status);

    long countCreditRequestsByClientEmail(String email);

    // ============================================
    // MÉTHODES POUR CONSEILLER (ADVISOR)
    // ============================================

    /**
     * ✅ Récupérer les demandes de crédit des clients d'un conseiller par son email
     */
    List<CreditResponseDTO> getCreditRequestsByAdvisorEmail(String advisorEmail);

    /**
     * ✅ Récupérer les demandes de crédit des clients d'un conseiller par son ID
     */
    List<CreditResponseDTO> getCreditRequestsByAdvisorId(String advisorId);

    /**
     * ✅ Récupérer les demandes de crédit d'un conseiller par statut
     */
    List<CreditResponseDTO> getCreditRequestsByAdvisorAndStatus(String advisorEmail, CreditStatus status);

    /**
     * ✅ Compter les demandes de crédit d'un conseiller
     */
    long countCreditRequestsByAdvisor(String advisorEmail);

    // ============================================
    // MÉTHODES DE TRANSMISSION
    // ============================================

    /**
     * ✅ Transmettre une demande à l'analyste
     */
    CreditResponseDTO transmitToAnalyst(String creditRequestId, String notes);

    /**
     * ✅ Transmettre une demande à l'analyste avec option de forçage
     */
    CreditResponseDTO transmitToAnalyst(String creditRequestId, String notes, boolean forceTransmit);

    /**
     * ✅ Vérifier si une demande peut être transmise
     */
    boolean canTransmitToAnalyst(String creditRequestId);

    /**
     * ✅ Récupérer les documents manquants pour une demande
     */
    List<String> getMissingDocumentsForTransmission(String creditRequestId);

    // ============================================
    // MÉTHODES D'ANNULATION
    // ============================================

    CreditResponseDTO cancelCreditRequest(String id);

    /**
     * ✅ Annuler une demande par le conseiller
     */
    CreditResponseDTO cancelCreditRequestByAdvisor(String id, String reason);

    // ============================================
    // MÉTHODES UTILITAIRES
    // ============================================

    CreditRequest getCreditRequestEntityById(String id);

    /**
     * ✅ Vérifier si un conseiller est le propriétaire de la demande
     */
    boolean isAdvisorOwnerOfCreditRequest(String advisorEmail, String creditRequestId);
}