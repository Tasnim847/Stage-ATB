package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.InterestRateRequestDTO;
import org.example.stage_atb.dto.response.InterestRateResponseDTO;
import org.example.stage_atb.entity.InterestRate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = "spring")
public interface InterestRateMapper {

    // ============================================
    // Entity -> Response DTO
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "creditTypeName", source = "creditTypeName")
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "minRate", source = "minRate")
    @Mapping(target = "maxRate", source = "maxRate")
    @Mapping(target = "isDefault", source = "isDefault")
    @Mapping(target = "clientCategory", source = "clientCategory")
    @Mapping(target = "rateAdjustment", source = "rateAdjustment")
    @Mapping(target = "effectiveDate", source = "effectiveDate")
    @Mapping(target = "expiryDate", source = "expiryDate")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    InterestRateResponseDTO toResponseDTO(InterestRate interestRate);

    // ============================================
    // Request DTO -> Entity
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "minRate", source = "minRate")
    @Mapping(target = "maxRate", source = "maxRate")
    @Mapping(target = "isDefault", source = "isDefault", defaultValue = "false")
    @Mapping(target = "clientCategory", source = "clientCategory")
    @Mapping(target = "rateAdjustment", source = "rateAdjustment")
    @Mapping(target = "effectiveDate", source = "effectiveDate")
    @Mapping(target = "expiryDate", source = "expiryDate")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    InterestRate toEntity(InterestRateRequestDTO request);

    // ============================================
    // Update Entity from Request DTO
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "minRate", source = "minRate")
    @Mapping(target = "maxRate", source = "maxRate")
    @Mapping(target = "isDefault", source = "isDefault", defaultValue = "false")
    @Mapping(target = "clientCategory", source = "clientCategory")
    @Mapping(target = "rateAdjustment", source = "rateAdjustment")
    @Mapping(target = "effectiveDate", source = "effectiveDate")
    @Mapping(target = "expiryDate", source = "expiryDate")
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(@MappingTarget InterestRate interestRate, InterestRateRequestDTO request);

    // ============================================
    // List mappings
    // ============================================

    List<InterestRateResponseDTO> toResponseDTOList(List<InterestRate> interestRates);

    // ============================================
    // Named methods
    // ============================================

    @Named("defaultEffectiveDate")
    default LocalDateTime defaultEffectiveDate(LocalDateTime date) {
        return date != null ? date : LocalDateTime.now();
    }
}
