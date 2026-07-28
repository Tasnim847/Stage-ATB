package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.DurationConfigRequestDTO;
import org.example.stage_atb.dto.response.DurationConfigResponseDTO;
import org.example.stage_atb.entity.DurationConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DurationConfigMapper {

    // ============================================
    // Entity -> Response DTO
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "creditTypeName", source = "creditTypeName")
    @Mapping(target = "durationMonths", source = "durationMonths")
    @Mapping(target = "label", source = "label")
    @Mapping(target = "isDefault", source = "isDefault")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    DurationConfigResponseDTO toResponseDTO(DurationConfig durationConfig);

    // ============================================
    // Request DTO -> Entity
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "durationMonths", source = "durationMonths")
    @Mapping(target = "label", source = "label")
    @Mapping(target = "isDefault", source = "isDefault", defaultValue = "false")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    DurationConfig toEntity(DurationConfigRequestDTO request);

    // ============================================
    // Update Entity from Request DTO
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "durationMonths", source = "durationMonths")
    @Mapping(target = "label", source = "label")
    @Mapping(target = "isDefault", source = "isDefault", defaultValue = "false")
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(@MappingTarget DurationConfig durationConfig, DurationConfigRequestDTO request);

    // ============================================
    // List mappings
    // ============================================

    List<DurationConfigResponseDTO> toResponseDTOList(List<DurationConfig> durationConfigs);
}