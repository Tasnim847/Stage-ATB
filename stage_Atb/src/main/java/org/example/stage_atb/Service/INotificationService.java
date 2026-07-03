package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.NotificationRequestDTO;
import org.example.stage_atb.dto.response.NotificationResponseDTO;
import org.example.stage_atb.enums.NotificationType;

import java.util.List;

public interface INotificationService {

    NotificationResponseDTO createNotification(NotificationRequestDTO notificationRequestDTO);

    NotificationResponseDTO getNotificationById(String id);

    List<NotificationResponseDTO> getNotificationsByUser(String userId);

    List<NotificationResponseDTO> getUnreadNotifications(String userId);

    List<NotificationResponseDTO> getNotificationsByType(String userId, NotificationType type);

    List<NotificationResponseDTO> getAllNotifications();

    NotificationResponseDTO updateNotification(String id, NotificationRequestDTO notificationRequestDTO);

    void deleteNotification(String id);

    NotificationResponseDTO markAsRead(String id);

    void markAllAsRead(String userId);

    long countUnreadByUser(String userId);

    void sendNotification(NotificationRequestDTO notificationRequestDTO);

    List<NotificationResponseDTO> getUnsentNotifications();

    void processNotifications();
}