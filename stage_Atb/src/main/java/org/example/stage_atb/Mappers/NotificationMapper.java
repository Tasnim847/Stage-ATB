package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.NotificationRequestDTO;
import org.example.stage_atb.dto.response.NotificationResponseDTO;
import org.example.stage_atb.entity.Notification;
import org.example.stage_atb.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", source = "userId", qualifiedByName = "buildUser")
    @Mapping(target = "read", constant = "false")
    @Mapping(target = "sent", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Notification toEntity(NotificationRequestDTO requestDTO);

    @Mapping(target = "createdAt", expression = "java(notification.getCreatedAt() != null ? notification.getCreatedAt() : null)")
    NotificationResponseDTO toResponseDTO(Notification notification);

    void updateEntity(@MappingTarget Notification notification, NotificationRequestDTO requestDTO);

    @Named("buildUser")
    default User buildUser(String userId) {
        if (userId == null) return null;
        User user = new User();
        user.setId(userId);
        return user;
    }
}