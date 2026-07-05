package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.INotificationService;
import org.example.stage_atb.dto.request.NotificationRequestDTO;
import org.example.stage_atb.dto.response.NotificationResponseDTO;
import org.example.stage_atb.enums.NotificationType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> createNotification(
            @Valid @RequestBody NotificationRequestDTO requestDTO) {
        NotificationResponseDTO response = notificationService.createNotification(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> getNotificationById(@PathVariable String id) {
        NotificationResponseDTO response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByUser(@PathVariable String userId) {
        List<NotificationResponseDTO> response = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications(@PathVariable String userId) {
        List<NotificationResponseDTO> response = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByType(
            @PathVariable String userId,
            @PathVariable NotificationType type) {
        List<NotificationResponseDTO> response = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications() {
        List<NotificationResponseDTO> response = notificationService.getAllNotifications();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> updateNotification(
            @PathVariable String id,
            @Valid @RequestBody NotificationRequestDTO requestDTO) {
        NotificationResponseDTO response = notificationService.updateNotification(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable String id) {
        NotificationResponseDTO response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Long> countUnreadByUser(@PathVariable String userId) {
        long count = notificationService.countUnreadByUser(userId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(@Valid @RequestBody NotificationRequestDTO requestDTO) {
        notificationService.sendNotification(requestDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unsent")
    public ResponseEntity<List<NotificationResponseDTO>> getUnsentNotifications() {
        List<NotificationResponseDTO> response = notificationService.getUnsentNotifications();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/process")
    public ResponseEntity<Void> processNotifications() {
        notificationService.processNotifications();
        return ResponseEntity.ok().build();
    }
}