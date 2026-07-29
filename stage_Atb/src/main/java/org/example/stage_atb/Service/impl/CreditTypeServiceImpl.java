// Service/impl/CreditTypeServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.CreditTypeMapper;
import org.example.stage_atb.Repositories.CreditTypeRepository;
import org.example.stage_atb.Repositories.DurationConfigRepository;
import org.example.stage_atb.Service.ICreditTypeService;
import org.example.stage_atb.dto.response.CreditTypeResponseDTO;
import org.example.stage_atb.entity.CreditType;
import org.example.stage_atb.entity.DurationConfig;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditTypeServiceImpl implements ICreditTypeService {

    private final CreditTypeRepository creditTypeRepository;
    private final DurationConfigRepository durationConfigRepository;
    private final CreditTypeMapper creditTypeMapper;

    @Override
    public List<CreditTypeResponseDTO> getActiveCreditTypes() {
        log.info("Getting active credit types");
        List<CreditType> creditTypes = creditTypeRepository.findActiveOrderByName();
        List<CreditTypeResponseDTO> dtos = creditTypeMapper.toResponseDTOList(creditTypes);

        // ✅ Ajouter les durées disponibles pour chaque type
        dtos.forEach(dto -> {
            List<Integer> durations = getAvailableDurations(dto.getId());
            dto.setAvailableDurations(durations);
            dto.setDefaultInterestRate(dto.getBaseInterestRate());
        });

        return dtos;
    }

    @Override
    public CreditTypeResponseDTO getCreditTypeById(String id) {
        log.info("Getting credit type by id: {}", id);
        CreditType creditType = creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found"));
        CreditTypeResponseDTO dto = creditTypeMapper.toResponseDTO(creditType);

        // ✅ Ajouter les durées disponibles
        List<Integer> durations = getAvailableDurations(id);
        dto.setAvailableDurations(durations);
        dto.setDefaultInterestRate(dto.getBaseInterestRate());

        return dto;
    }

    @Override
    public CreditType getCreditTypeEntity(String id) {
        return creditTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit type not found"));
    }

    @Override
    public CreditTypeResponseDTO getCreditTypeWithParams(String id) {
        log.info("Getting credit type with params for id: {}", id);

        CreditType creditType = getCreditTypeEntity(id);
        CreditTypeResponseDTO dto = creditTypeMapper.toResponseDTO(creditType);

        // ✅ Ajouter les durées disponibles
        List<Integer> durations = getAvailableDurations(id);
        dto.setAvailableDurations(durations);
        dto.setDefaultInterestRate(dto.getBaseInterestRate());

        return dto;
    }

    @Override
    public boolean validateAmount(String creditTypeId, Double amount) {
        CreditType creditType = getCreditTypeEntity(creditTypeId);
        return amount >= creditType.getMinAmount() && amount <= creditType.getMaxAmount();
    }

    @Override
    public boolean validateDuration(String creditTypeId, Integer durationMonths) {
        CreditType creditType = getCreditTypeEntity(creditTypeId);
        return durationMonths >= creditType.getMinDurationMonths() &&
                durationMonths <= creditType.getMaxDurationMonths();
    }

    @Override
    public List<Integer> getAvailableDurations(String creditTypeId) {
        return durationConfigRepository
                .findByCreditTypeIdAndIsActiveTrueOrderByDurationMonthsAsc(creditTypeId)
                .stream()
                .map(DurationConfig::getDurationMonths)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getRequiredDocuments(String creditTypeId) {
        CreditType creditType = getCreditTypeEntity(creditTypeId);
        return creditType.getRequiredDocuments();
    }
}