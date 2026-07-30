// core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { NotificationResponseDTO, NotificationRequestDTO } from '@core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Récupérer les notifications de l'utilisateur connecté
   */
  getMyNotifications(): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.apiUrl}/notifications/my`);
  }

  /**
   * Récupérer les notifications non lues
   */
  getUnreadNotifications(): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.apiUrl}/notifications/my/unread`);
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  /**
   * Créer une notification (Admin seulement)
   */
  createNotification(notification: NotificationRequestDTO): Observable<NotificationResponseDTO> {
    return this.http.post<NotificationResponseDTO>(`${this.apiUrl}/notifications`, notification);
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/${id}`);
  }

  /**
   * Compter les notifications non lues
   */
  countUnread(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/my/unread/count`);
  }
}