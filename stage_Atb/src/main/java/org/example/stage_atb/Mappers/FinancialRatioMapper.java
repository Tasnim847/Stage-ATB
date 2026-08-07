package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.FinancialRatioRequest;
import org.example.stage_atb.dto.response.FinancialRatioResponse;
import org.example.stage_atb.entity.FinancialRatio;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FinancialRatioMapper {

    @Mapping(target = "key", source = "key")
    FinancialRatioResponse toResponse(FinancialRatio entity);

    // ✅ Ignorer key à la création
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "key", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    FinancialRatio toEntity(FinancialRatioRequest request);

    // ✅ Ignorer key dans la mise à jour
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "key", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget FinancialRatio entity, FinancialRatioRequest request);
}