package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.RiskThresholdRequest;
import org.example.stage_atb.dto.response.RiskThresholdResponse;
import org.example.stage_atb.entity.RiskThreshold;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RiskThresholdMapper {

    RiskThresholdResponse toResponse(RiskThreshold entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    RiskThreshold toEntity(RiskThresholdRequest request);
}