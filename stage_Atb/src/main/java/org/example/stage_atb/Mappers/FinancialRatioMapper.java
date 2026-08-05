package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.FinancialRatioRequest;
import org.example.stage_atb.dto.response.FinancialRatioResponse;
import org.example.stage_atb.entity.FinancialRatio;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FinancialRatioMapper {

    @Mapping(target = "key", source = "key")
    FinancialRatioResponse toResponse(FinancialRatio entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "key", source = "key")
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    FinancialRatio toEntity(FinancialRatioRequest request);
}