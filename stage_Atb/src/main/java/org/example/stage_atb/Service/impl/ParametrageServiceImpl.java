// Service/impl/ParametrageServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.*;
import org.example.stage_atb.Repositories.*;
import org.example.stage_atb.Service.ParametrageService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ParametrageServiceImpl implements ParametrageService {

    // Repositories
    private final CreditTypeRepository creditTypeRepository;
    private final InterestRateRepository interestRateRepository;
    private final DurationConfigRepository durationConfigRepository;
    private final CeilingConfigRepository ceilingConfigRepository;

    // Mappers
    private final CreditTypeMapper creditTypeMapper;
    private final InterestRateMapper interestRateMapper;
    private final DurationConfigMapper durationConfigMapper;
    private final CeilingConfigMapper ceilingConfigMapper;

    // ============================================
    // TYPES DE CRÉDIT
    // ============================================

    @Override
    public List<CreditTypeResponseDTO> getAllCreditTypes() {
        log.info("Getting all credit types");
        return creditTypeMapper.toResponseDTOList(creditTypeRepository.findAll());
    }

    @Override
    public List<CreditTypeResponseDTO> getActiveCreditTypes() {
        log.info("Getting active credit types");
        return creditTypeMapper.toResponseDTOList(creditTypeRepository.findActiveOrderByName());
    }

    @Override
    public CreditTypeResponseDTO getCreditTypeById(String id) {
        log.info("Getting credit type by id: {}", id);
        CreditType creditType = creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found with id: " + id));
        return creditTypeMapper.toResponseDTO(creditType);
    }

    @Override
    public CreditTypeResponseDTO createCreditType(CreditTypeRequestDTO request) {
        log.info("Creating credit type: {}", request.getName());

        if (creditTypeRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Credit type with code '" + request.getCode() + "' already exists");
        }

        validateCreditType(request);

        CreditType creditType = creditTypeMapper.toEntity(request);
        creditType.setIsActive(true);

        CreditType saved = creditTypeRepository.save(creditType);
        log.info("Credit type created with id: {}", saved.getId());

        return creditTypeMapper.toResponseDTO(saved);
    }

    @Override
    public CreditTypeResponseDTO updateCreditType(String id, CreditTypeRequestDTO request) {
        log.info("Updating credit type: {}", id);

        CreditType creditType = creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found with id: " + id));

        if (!creditType.getCode().equals(request.getCode()) &&
                creditTypeRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Credit type with code '" + request.getCode() + "' already exists");
        }

        validateCreditType(request);

        creditTypeMapper.updateEntity(creditType, request);

        CreditType updated = creditTypeRepository.save(creditType);
        log.info("Credit type updated with id: {}", updated.getId());

        return creditTypeMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteCreditType(String id) {
        log.info("Deleting credit type: {}", id);
        if (!creditTypeRepository.existsById(id)) {
            throw new RuntimeException("Credit type not found with id: " + id);
        }
        creditTypeRepository.deleteById(id);
        log.info("Credit type deleted with id: {}", id);
    }

    @Override
    public CreditTypeResponseDTO toggleCreditTypeStatus(String id) {
        log.info("Toggling credit type status: {}", id);
        CreditType creditType = creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found with id: " + id));

        creditType.setIsActive(!creditType.getIsActive());
        CreditType updated = creditTypeRepository.save(creditType);
        log.info("Credit type status toggled. New status: {}", updated.getIsActive());

        return creditTypeMapper.toResponseDTO(updated);
    }

    @Override
    public CreditType getCreditTypeEntity(String id) {
        return creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found with id: " + id));
    }

    // ============================================
    // TAUX D'INTÉRÊT
    // ============================================

    @Override
    public List<InterestRateResponseDTO> getAllInterestRates() {
        log.info("Getting all interest rates");
        return interestRateMapper.toResponseDTOList(interestRateRepository.findAll());
    }

    @Override
    public List<InterestRateResponseDTO> getInterestRatesByCreditType(String creditTypeId) {
        log.info("Getting interest rates for credit type: {}", creditTypeId);
        return interestRateMapper.toResponseDTOList(
                interestRateRepository.findByCreditTypeId(creditTypeId)
        );
    }

    @Override
    public InterestRateResponseDTO getInterestRateById(String id) {
        log.info("Getting interest rate by id: {}", id);
        InterestRate interestRate = interestRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest rate not found with id: " + id));
        return interestRateMapper.toResponseDTO(interestRate);
    }

    @Override
    public InterestRateResponseDTO getDefaultInterestRate(String creditTypeId) {
        log.info("Getting default interest rate for credit type: {}", creditTypeId);
        InterestRate interestRate = interestRateRepository.findByCreditTypeIdAndIsDefaultTrue(creditTypeId)
                .orElseThrow(() -> new RuntimeException("Default interest rate not found for credit type: " + creditTypeId));
        return interestRateMapper.toResponseDTO(interestRate);
    }

    @Override
    public InterestRateResponseDTO createInterestRate(InterestRateRequestDTO request) {
        log.info("Creating interest rate for credit type: {}", request.getCreditTypeId());

        // Vérifier que le type de crédit existe
        if (!creditTypeRepository.existsById(request.getCreditTypeId())) {
            throw new RuntimeException("Credit type not found with id: " + request.getCreditTypeId());
        }

        // Si c'est le taux par défaut, désactiver les autres taux par défaut
        if (request.getIsDefault() != null && request.getIsDefault()) {
            interestRateRepository.findByCreditTypeIdAndIsDefaultTrue(request.getCreditTypeId())
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        interestRateRepository.save(existing);
                    });
        }

        // Récupérer le nom du type de crédit
        CreditType creditType = creditTypeRepository.findById(request.getCreditTypeId()).get();
        InterestRate interestRate = interestRateMapper.toEntity(request);
        interestRate.setCreditTypeName(creditType.getName());
        interestRate.setCreatedBy("SYSTEM");
        interestRate.setEffectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : LocalDateTime.now());

        InterestRate saved = interestRateRepository.save(interestRate);
        log.info("Interest rate created with id: {}", saved.getId());

        return interestRateMapper.toResponseDTO(saved);
    }

    @Override
    public InterestRateResponseDTO updateInterestRate(String id, InterestRateRequestDTO request) {
        log.info("Updating interest rate: {}", id);

        InterestRate interestRate = interestRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest rate not found with id: " + id));

        // Si c'est le taux par défaut, désactiver les autres taux par défaut
        if (request.getIsDefault() != null && request.getIsDefault()) {
            interestRateRepository.findByCreditTypeIdAndIsDefaultTrue(interestRate.getCreditTypeId())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            existing.setIsDefault(false);
                            interestRateRepository.save(existing);
                        }
                    });
        }

        interestRateMapper.updateEntity(interestRate, request);
        interestRate.setUpdatedAt(LocalDateTime.now());

        InterestRate updated = interestRateRepository.save(interestRate);
        log.info("Interest rate updated with id: {}", updated.getId());

        return interestRateMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteInterestRate(String id) {
        log.info("Deleting interest rate: {}", id);
        if (!interestRateRepository.existsById(id)) {
            throw new RuntimeException("Interest rate not found with id: " + id);
        }
        interestRateRepository.deleteById(id);
        log.info("Interest rate deleted with id: {}", id);
    }

    @Override
    public InterestRateResponseDTO toggleInterestRateStatus(String id) {
        log.info("Toggling interest rate status: {}", id);
        InterestRate interestRate = interestRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest rate not found with id: " + id));

        interestRate.setIsActive(!interestRate.getIsActive());
        InterestRate updated = interestRateRepository.save(interestRate);
        log.info("Interest rate status toggled. New status: {}", updated.getIsActive());

        return interestRateMapper.toResponseDTO(updated);
    }

    @Override
    public InterestRate getInterestRateEntity(String id) {
        return interestRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest rate not found with id: " + id));
    }

    // ============================================
    // DURÉES
    // ============================================

    @Override
    public List<DurationConfigResponseDTO> getAllDurations() {
        log.info("Getting all durations");
        return durationConfigMapper.toResponseDTOList(durationConfigRepository.findAll());
    }

    @Override
    public List<DurationConfigResponseDTO> getDurationsByCreditType(String creditTypeId) {
        log.info("Getting durations for credit type: {}", creditTypeId);
        return durationConfigMapper.toResponseDTOList(
                durationConfigRepository.findByCreditTypeIdAndIsActiveTrueOrderByDurationMonthsAsc(creditTypeId)
        );
    }

    @Override
    public DurationConfigResponseDTO getDurationById(String id) {
        log.info("Getting duration by id: {}", id);
        DurationConfig duration = durationConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Duration config not found with id: " + id));
        return durationConfigMapper.toResponseDTO(duration);
    }

    @Override
    public DurationConfigResponseDTO getDefaultDuration(String creditTypeId) {
        log.info("Getting default duration for credit type: {}", creditTypeId);
        DurationConfig duration = durationConfigRepository.findByCreditTypeIdAndIsDefaultTrue(creditTypeId)
                .orElseThrow(() -> new RuntimeException("Default duration not found for credit type: " + creditTypeId));
        return durationConfigMapper.toResponseDTO(duration);
    }

    @Override
    public DurationConfigResponseDTO createDuration(DurationConfigRequestDTO request) {
        log.info("Creating duration for credit type: {}", request.getCreditTypeId());

        // Vérifier que le type de crédit existe
        if (!creditTypeRepository.existsById(request.getCreditTypeId())) {
            throw new RuntimeException("Credit type not found with id: " + request.getCreditTypeId());
        }

        // Vérifier que la durée n'existe pas déjà
        if (durationConfigRepository.existsByCreditTypeIdAndDurationMonths(
                request.getCreditTypeId(), request.getDurationMonths())) {
            throw new RuntimeException("Duration " + request.getDurationMonths() + " months already exists for this credit type");
        }

        // Si c'est la durée par défaut, désactiver les autres durées par défaut
        if (request.getIsDefault() != null && request.getIsDefault()) {
            durationConfigRepository.findByCreditTypeIdAndIsDefaultTrue(request.getCreditTypeId())
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        durationConfigRepository.save(existing);
                    });
        }

        CreditType creditType = creditTypeRepository.findById(request.getCreditTypeId()).get();
        DurationConfig duration = durationConfigMapper.toEntity(request);
        duration.setCreditTypeName(creditType.getName());

        DurationConfig saved = durationConfigRepository.save(duration);
        log.info("Duration created with id: {}", saved.getId());

        return durationConfigMapper.toResponseDTO(saved);
    }

    @Override
    public DurationConfigResponseDTO updateDuration(String id, DurationConfigRequestDTO request) {
        log.info("Updating duration: {}", id);

        DurationConfig duration = durationConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Duration config not found with id: " + id));

        // Vérifier que la durée n'existe pas déjà (pour un autre ID)
        durationConfigRepository.findByCreditTypeIdAndDurationMonths(
                        request.getCreditTypeId(), request.getDurationMonths())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Duration " + request.getDurationMonths() + " months already exists");
                    }
                });

        // Si c'est la durée par défaut, désactiver les autres durées par défaut
        if (request.getIsDefault() != null && request.getIsDefault()) {
            durationConfigRepository.findByCreditTypeIdAndIsDefaultTrue(duration.getCreditTypeId())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            existing.setIsDefault(false);
                            durationConfigRepository.save(existing);
                        }
                    });
        }

        durationConfigMapper.updateEntity(duration, request);
        duration.setUpdatedAt(LocalDateTime.now());

        DurationConfig updated = durationConfigRepository.save(duration);
        log.info("Duration updated with id: {}", updated.getId());

        return durationConfigMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteDuration(String id) {
        log.info("Deleting duration: {}", id);
        if (!durationConfigRepository.existsById(id)) {
            throw new RuntimeException("Duration config not found with id: " + id);
        }
        durationConfigRepository.deleteById(id);
        log.info("Duration deleted with id: {}", id);
    }

    @Override
    public DurationConfigResponseDTO toggleDurationStatus(String id) {
        log.info("Toggling duration status: {}", id);
        DurationConfig duration = durationConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Duration config not found with id: " + id));

        duration.setIsActive(!duration.getIsActive());
        DurationConfig updated = durationConfigRepository.save(duration);
        log.info("Duration status toggled. New status: {}", updated.getIsActive());

        return durationConfigMapper.toResponseDTO(updated);
    }

    @Override
    public DurationConfig getDurationEntity(String id) {
        return durationConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Duration config not found with id: " + id));
    }

    // ============================================
    // PLAFONDS
    // ============================================

    @Override
    public List<CeilingConfigResponseDTO> getAllCeilings() {
        log.info("Getting all ceilings");
        return ceilingConfigMapper.toResponseDTOList(ceilingConfigRepository.findAll());
    }

    @Override
    public List<CeilingConfigResponseDTO> getCeilingsByCreditType(String creditTypeId) {
        log.info("Getting ceilings for credit type: {}", creditTypeId);
        return ceilingConfigMapper.toResponseDTOList(
                ceilingConfigRepository.findByCreditTypeIdAndIsActiveTrue(creditTypeId)
        );
    }

    @Override
    public CeilingConfigResponseDTO getCeilingById(String id) {
        log.info("Getting ceiling by id: {}", id);
        CeilingConfig ceiling = ceilingConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ceiling config not found with id: " + id));
        return ceilingConfigMapper.toResponseDTO(ceiling);
    }

    @Override
    public CeilingConfigResponseDTO getCeilingByAmount(String creditTypeId, Double amount) {
        log.info("Getting ceiling for credit type: {} and amount: {}", creditTypeId, amount);
        CeilingConfig ceiling = ceilingConfigRepository.findByCreditTypeIdAndAmountBetween(creditTypeId, amount)
                .orElseThrow(() -> new RuntimeException("No ceiling found for credit type: " + creditTypeId + " and amount: " + amount));
        return ceilingConfigMapper.toResponseDTO(ceiling);
    }

    @Override
    public CeilingConfigResponseDTO createCeiling(CeilingConfigRequestDTO request) {
        log.info("Creating ceiling for credit type: {}", request.getCreditTypeId());

        // Vérifier que le type de crédit existe
        if (!creditTypeRepository.existsById(request.getCreditTypeId())) {
            throw new RuntimeException("Credit type not found with id: " + request.getCreditTypeId());
        }

        // Vérifier que les montants sont valides
        if (request.getMinAmount() > request.getMaxAmount()) {
            throw new RuntimeException("Le montant minimum ne peut pas être supérieur au montant maximum");
        }

        CreditType creditType = creditTypeRepository.findById(request.getCreditTypeId()).get();
        CeilingConfig ceiling = ceilingConfigMapper.toEntity(request);
        ceiling.setCreditTypeName(creditType.getName());

        CeilingConfig saved = ceilingConfigRepository.save(ceiling);
        log.info("Ceiling created with id: {}", saved.getId());

        return ceilingConfigMapper.toResponseDTO(saved);
    }

    @Override
    public CeilingConfigResponseDTO updateCeiling(String id, CeilingConfigRequestDTO request) {
        log.info("Updating ceiling: {}", id);

        CeilingConfig ceiling = ceilingConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ceiling config not found with id: " + id));

        // Vérifier que les montants sont valides
        if (request.getMinAmount() > request.getMaxAmount()) {
            throw new RuntimeException("Le montant minimum ne peut pas être supérieur au montant maximum");
        }

        ceilingConfigMapper.updateEntity(ceiling, request);
        ceiling.setUpdatedAt(LocalDateTime.now());

        CeilingConfig updated = ceilingConfigRepository.save(ceiling);
        log.info("Ceiling updated with id: {}", updated.getId());

        return ceilingConfigMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteCeiling(String id) {
        log.info("Deleting ceiling: {}", id);
        if (!ceilingConfigRepository.existsById(id)) {
            throw new RuntimeException("Ceiling config not found with id: " + id);
        }
        ceilingConfigRepository.deleteById(id);
        log.info("Ceiling deleted with id: {}", id);
    }

    @Override
    public CeilingConfigResponseDTO toggleCeilingStatus(String id) {
        log.info("Toggling ceiling status: {}", id);
        CeilingConfig ceiling = ceilingConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ceiling config not found with id: " + id));

        ceiling.setIsActive(!ceiling.getIsActive());
        CeilingConfig updated = ceilingConfigRepository.save(ceiling);
        log.info("Ceiling status toggled. New status: {}", updated.getIsActive());

        return ceilingConfigMapper.toResponseDTO(updated);
    }

    @Override
    public CeilingConfig getCeilingEntity(String id) {
        return ceilingConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ceiling config not found with id: " + id));
    }

    // ============================================
    // MÉTHODES DE VALIDATION
    // ============================================

    @Override
    public boolean validateAmount(String creditTypeId, Double amount) {
        log.info("Validating amount: {} for credit type: {}", amount, creditTypeId);
        return ceilingConfigRepository.findByCreditTypeIdAndAmountBetween(creditTypeId, amount).isPresent();
    }

    // ============================================
    // MÉTHODES PRIVÉES UTILITAIRES
    // ============================================

    private void validateCreditType(CreditTypeRequestDTO request) {
        if (request.getMinDurationMonths() > request.getMaxDurationMonths()) {
            throw new RuntimeException("La durée minimale ne peut pas être supérieure à la durée maximale");
        }

        if (request.getMinAmount() > request.getMaxAmount()) {
            throw new RuntimeException("Le montant minimum ne peut pas être supérieur au montant maximum");
        }

        if (request.getBaseInterestRate() < 0 || request.getBaseInterestRate() > 100) {
            throw new RuntimeException("Le taux d'intérêt doit être entre 0 et 100%");
        }
    }
}