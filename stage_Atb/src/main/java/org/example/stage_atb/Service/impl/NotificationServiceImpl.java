package org.example.stage_atb.Service.impl;


import org.example.stage_atb.Service.INotificationService;
import org.example.stage_atb.dto.request.NotificationRequestDTO;
import org.example.stage_atb.dto.response.NotificationResponseDTO;
import org.example.stage_atb.entity.Notification;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.NotificationType;
import org.example.stage_atb.Mappers.NotificationMapper;
import org.example.stage_atb.Repositories.NotificationRepository;
import org.example.stage_atb.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

    @Override
    public NotificationResponseDTO createNotification(NotificationRequestDTO notificationRequestDTO) {
        log.info("Creating notification for user: {}", notificationRequestDTO.getUserId());

        // Vérifier que l'utilisateur existe
        User user = userRepository.findById(notificationRequestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + notificationRequestDTO.getUserId()));

        // Créer la notification
        Notification notification = notificationMapper.toEntity(notificationRequestDTO);
        notification.setUser(user);
        notification.setRead(false);
        notification.setSent(false);
        notification.setCreatedAt(LocalDateTime.now());

        // Sauvegarder
        Notification savedNotification = notificationRepository.save(notification);

        return notificationMapper.toResponseDTO(savedNotification);
    }

    @Override
    public NotificationResponseDTO getNotificationById(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return notificationMapper.toResponseDTO(notification);
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(notificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponseDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId)
                .stream()
                .map(notificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsByType(String userId, NotificationType type) {
        return notificationRepository.findByUserIdAndType(userId, type)
                .stream()
                .map(notificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(notificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponseDTO updateNotification(String id, NotificationRequestDTO notificationRequestDTO) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notificationMapper.updateEntity(notification, notificationRequestDTO);

        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toResponseDTO(updatedNotification);
    }

    @Override
    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
        log.info("Notification deleted with id: {}", id);
    }

    @Override
    public NotificationResponseDTO markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);

        log.info("Notification marked as read: {}", id);
        return notificationMapper.toResponseDTO(updatedNotification);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadFalse(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
        log.info("All notifications marked as read for user: {}", userId);
    }

    @Override
    public long countUnreadByUser(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public void sendNotification(NotificationRequestDTO notificationRequestDTO) {
        // Créer la notification
        NotificationResponseDTO createdNotification = createNotification(notificationRequestDTO);

        // Marquer comme envoyée
        Notification notification = notificationRepository.findById(createdNotification.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setSent(true);
        notificationRepository.save(notification);

        // Logique d'envoi réel (email, SMS, push notification, etc.)
        log.info("Notification sent: {}", createdNotification.getTitle());

        // Ici, vous pouvez intégrer :
        // - Envoi d'email avec JavaMailSender
        // - Envoi de SMS avec Twilio
        // - Notification push avec Firebase
        // - WebSocket pour notification en temps réel
    }

    @Override
    public List<NotificationResponseDTO> getUnsentNotifications() {
        return notificationRepository.findUnsentNotifications()
                .stream()
                .map(notificationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void processNotifications() {
        log.info("Processing unsent notifications...");

        List<Notification> unsentNotifications = notificationRepository.findUnsentNotifications();

        for (Notification notification : unsentNotifications) {
            try {
                // Envoyer la notification
                // Implémentez votre logique d'envoi ici

                notification.setSent(true);
                notificationRepository.save(notification);
                log.info("Notification processed: {}", notification.getId());
            } catch (Exception e) {
                log.error("Failed to process notification: {}", notification.getId(), e);
            }
        }

        log.info("Processed {} notifications", unsentNotifications.size());
    }
}