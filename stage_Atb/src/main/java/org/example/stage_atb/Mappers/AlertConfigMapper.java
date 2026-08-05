package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.AlertConfigRequest;
import org.example.stage_atb.dto.response.AlertConfigResponse;
import org.example.stage_atb.entity.AlertConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface AlertConfigMapper {

    @Mapping(target = "recipients", expression = "java(splitRecipients(entity.getRecipients()))")
    @Mapping(target = "notificationMethods", expression = "java(splitNotificationMethods(entity.getNotificationMethods()))")
    AlertConfigResponse toResponse(AlertConfig entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipients", expression = "java(joinRecipients(request.getRecipients()))")
    @Mapping(target = "notificationMethods", expression = "java(joinNotificationMethods(request.getNotificationMethods()))")
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    AlertConfig toEntity(AlertConfigRequest request);

    @Named("splitRecipients")
    default List<String> splitRecipients(String recipients) {
        if (recipients == null || recipients.isEmpty()) return List.of();
        return Arrays.asList(recipients.split(","));
    }

    @Named("splitNotificationMethods")
    default List<String> splitNotificationMethods(String methods) {
        if (methods == null || methods.isEmpty()) return List.of();
        return Arrays.asList(methods.split(","));
    }

    @Named("joinRecipients")
    default String joinRecipients(List<String> recipients) {
        if (recipients == null || recipients.isEmpty()) return "";
        return String.join(",", recipients);
    }

    @Named("joinNotificationMethods")
    default String joinNotificationMethods(List<String> methods) {
        if (methods == null || methods.isEmpty()) return "";
        return String.join(",", methods);
    }
}