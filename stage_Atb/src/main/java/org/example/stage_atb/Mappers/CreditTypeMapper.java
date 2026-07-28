package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.CreditTypeRequestDTO;
import org.example.stage_atb.dto.response.CreditTypeResponseDTO;
import org.example.stage_atb.entity.CreditType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CreditTypeMapper {

    // ============================================
    // Entity -> Response DTO
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "minDurationMonths", source = "minDurationMonths")
    @Mapping(target = "maxDurationMonths", source = "maxDurationMonths")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "baseInterestRate", source = "baseInterestRate")
    @Mapping(target = "requiresCollateral", source = "requiresCollateral")
    @Mapping(target = "requiresGuarantor", source = "requiresGuarantor")
    @Mapping(target = "requiredDocuments", source = "requiredDocuments", qualifiedByName = "emptyListIfNull")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    CreditTypeResponseDTO toResponseDTO(CreditType creditType);

    // ============================================
    // Request DTO -> Entity
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "code")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "minDurationMonths", source = "minDurationMonths")
    @Mapping(target = "maxDurationMonths", source = "maxDurationMonths")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "baseInterestRate", source = "baseInterestRate")
    @Mapping(target = "requiresCollateral", source = "requiresCollateral", defaultValue = "false")
    @Mapping(target = "requiresGuarantor", source = "requiresGuarantor", defaultValue = "false")
    @Mapping(target = "requiredDocuments", source = "requiredDocuments", qualifiedByName = "emptyListIfNull")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    CreditType toEntity(CreditTypeRequestDTO request);

    // ============================================
    // Update Entity from Request DTO
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "code")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "minDurationMonths", source = "minDurationMonths")
    @Mapping(target = "maxDurationMonths", source = "maxDurationMonths")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "baseInterestRate", source = "baseInterestRate")
    @Mapping(target = "requiresCollateral", source = "requiresCollateral", defaultValue = "false")
    @Mapping(target = "requiresGuarantor", source = "requiresGuarantor", defaultValue = "false")
    @Mapping(target = "requiredDocuments", source = "requiredDocuments", qualifiedByName = "emptyListIfNull")
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(@MappingTarget CreditType creditType, CreditTypeRequestDTO request);

    // ============================================
    // List mappings
    // ============================================

    List<CreditTypeResponseDTO> toResponseDTOList(List<CreditType> creditTypes);

    // ============================================
    // Named methods
    // ============================================

    @Named("emptyListIfNull")
    default List<String> emptyListIfNull(List<String> list) {
        return list != null ? list : new ArrayList<>();
    }

    @Named("toUpperCase")
    default String toUpperCase(String value) {
        return value != null ? value.toUpperCase() : null;
    }
}