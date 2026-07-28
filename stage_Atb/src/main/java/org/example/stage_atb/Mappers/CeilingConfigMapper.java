package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.CeilingConfigRequestDTO;
import org.example.stage_atb.dto.response.CeilingConfigResponseDTO;
import org.example.stage_atb.entity.CeilingConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CeilingConfigMapper {

    // ============================================
    // Entity -> Response DTO
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "creditTypeName", source = "creditTypeName")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "currency", source = "currency")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "approvalLevel", source = "approvalLevel")
    @Mapping(target = "requiresAdditionalApproval", source = "requiresAdditionalApproval")
    @Mapping(target = "additionalApprovalLevel", source = "additionalApprovalLevel")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    CeilingConfigResponseDTO toResponseDTO(CeilingConfig ceilingConfig);

    // ============================================
    // Request DTO -> Entity
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "currency", source = "currency", defaultValue = "TND")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "approvalLevel", source = "approvalLevel")
    @Mapping(target = "requiresAdditionalApproval", source = "requiresAdditionalApproval", defaultValue = "false")
    @Mapping(target = "additionalApprovalLevel", source = "additionalApprovalLevel")
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    CeilingConfig toEntity(CeilingConfigRequestDTO request);

    // ============================================
    // Update Entity from Request DTO
    // ============================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creditTypeId", source = "creditTypeId")
    @Mapping(target = "minAmount", source = "minAmount")
    @Mapping(target = "maxAmount", source = "maxAmount")
    @Mapping(target = "currency", source = "currency", defaultValue = "TND")
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "approvalLevel", source = "approvalLevel")
    @Mapping(target = "requiresAdditionalApproval", source = "requiresAdditionalApproval", defaultValue = "false")
    @Mapping(target = "additionalApprovalLevel", source = "additionalApprovalLevel")
    @Mapping(target = "creditTypeName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(@MappingTarget CeilingConfig ceilingConfig, CeilingConfigRequestDTO request);

    // ============================================
    // List mappings
    // ============================================

    List<CeilingConfigResponseDTO> toResponseDTOList(List<CeilingConfig> ceilingConfigs);
}
