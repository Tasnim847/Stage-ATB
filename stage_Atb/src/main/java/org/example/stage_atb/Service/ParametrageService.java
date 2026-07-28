// Service/ParametrageService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.*;

import java.util.List;

public interface ParametrageService {

    // ============================================
    // TYPES DE CRÉDIT
    // ============================================

    List<CreditTypeResponseDTO> getAllCreditTypes();

    List<CreditTypeResponseDTO> getActiveCreditTypes();

    CreditTypeResponseDTO getCreditTypeById(String id);

    CreditTypeResponseDTO createCreditType(CreditTypeRequestDTO request);

    CreditTypeResponseDTO updateCreditType(String id, CreditTypeRequestDTO request);

    void deleteCreditType(String id);

    CreditTypeResponseDTO toggleCreditTypeStatus(String id);

    CreditType getCreditTypeEntity(String id);

    // ============================================
    // TAUX D'INTÉRÊT
    // ============================================

    List<InterestRateResponseDTO> getAllInterestRates();

    List<InterestRateResponseDTO> getInterestRatesByCreditType(String creditTypeId);

    InterestRateResponseDTO getInterestRateById(String id);

    InterestRateResponseDTO getDefaultInterestRate(String creditTypeId);

    InterestRateResponseDTO createInterestRate(InterestRateRequestDTO request);

    InterestRateResponseDTO updateInterestRate(String id, InterestRateRequestDTO request);

    void deleteInterestRate(String id);

    InterestRateResponseDTO toggleInterestRateStatus(String id);

    InterestRate getInterestRateEntity(String id);

    // ============================================
    // DURÉES
    // ============================================

    List<DurationConfigResponseDTO> getAllDurations();

    List<DurationConfigResponseDTO> getDurationsByCreditType(String creditTypeId);

    DurationConfigResponseDTO getDurationById(String id);

    DurationConfigResponseDTO getDefaultDuration(String creditTypeId);

    DurationConfigResponseDTO createDuration(DurationConfigRequestDTO request);

    DurationConfigResponseDTO updateDuration(String id, DurationConfigRequestDTO request);

    void deleteDuration(String id);

    DurationConfigResponseDTO toggleDurationStatus(String id);

    DurationConfig getDurationEntity(String id);

    // ============================================
    // PLAFONDS
    // ============================================

    List<CeilingConfigResponseDTO> getAllCeilings();

    List<CeilingConfigResponseDTO> getCeilingsByCreditType(String creditTypeId);

    CeilingConfigResponseDTO getCeilingById(String id);

    CeilingConfigResponseDTO getCeilingByAmount(String creditTypeId, Double amount);

    CeilingConfigResponseDTO createCeiling(CeilingConfigRequestDTO request);

    CeilingConfigResponseDTO updateCeiling(String id, CeilingConfigRequestDTO request);

    void deleteCeiling(String id);

    CeilingConfigResponseDTO toggleCeilingStatus(String id);

    CeilingConfig getCeilingEntity(String id);

    // ============================================
    // MÉTHODES DE VALIDATION
    // ============================================

    boolean validateAmount(String creditTypeId, Double amount);
}