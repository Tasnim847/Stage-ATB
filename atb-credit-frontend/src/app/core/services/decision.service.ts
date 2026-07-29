// src/app/core/services/decision.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { CreditResponseDTO, CreditStatus } from '@core/models';

@Injectable({
  providedIn: 'root'
})


export class DecisionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les décisions en attente (PENDING_ANALYSIS et UNDER_REVIEW)
   */
  getPendingDecisions(page: number, size: number): Observable<any> {
    // Utiliser les endpoints existants pour l'analyste
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/analyst/my-clients`).pipe(
      map(requests => {
        // Filtrer les demandes en attente d'analyse
        const pending = requests.filter(r => 
          r.status === CreditStatus.PENDING_ANALYSIS || 
          r.status === CreditStatus.UNDER_REVIEW
        );
        
        // Pagination manuelle
        const start = page * size;
        const end = start + size;
        const items = pending.slice(start, end);
        
        return {
          items: items.map(r => this.mapToDecisionPending(r)),
          total: pending.length,
          page: page,
          size: size
        };
      })
    );
  }

  /**
   * Récupérer les décisions approuvées
   */
  getApprovedDecisions(page: number, size: number): Observable<any> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/analyst/my-clients`).pipe(
      map(requests => {
        const approved = requests.filter(r => r.status === CreditStatus.APPROVED);
        const start = page * size;
        const end = start + size;
        const items = approved.slice(start, end);
        
        return {
          items: items.map(r => this.mapToDecisionApproved(r)),
          total: approved.length,
          page: page,
          size: size
        };
      })
    );
  }

  /**
   * Récupérer les décisions refusées
   */
  getRejectedDecisions(page: number, size: number): Observable<any> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/analyst/my-clients`).pipe(
      map(requests => {
        const rejected = requests.filter(r => r.status === CreditStatus.REJECTED);
        const start = page * size;
        const end = start + size;
        const items = rejected.slice(start, end);
        
        return {
          items: items.map(r => this.mapToDecisionRejected(r)),
          total: rejected.length,
          page: page,
          size: size
        };
      })
    );
  }

  /**
   * Récupérer une décision par ID
   */
  getDecisionById(decisionId: string): Observable<any> {
    return this.http.get<CreditResponseDTO>(`${this.apiUrl}/credit-requests/${decisionId}`).pipe(
      map(request => this.mapToDecisionDetail(request))
    );
  }

  /**
   * Récupérer les données d'analyse (simulation)
   */
  getAnalysisData(decisionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/credit-requests/${decisionId}/simulation`).pipe(
      map((simulation: any) => {
        // Transformer les données de simulation en analyse
        return {
          score: simulation.riskScore || 65,
          recommendation: this.getRecommendation(simulation),
          riskFactors: this.getRiskFactors(simulation),
          strengths: this.getStrengths(simulation),
          documents: []
        };
      })
    );
  }

  /**
   * Approuver une décision
   */
  approveDecision(data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/credit-requests/${data.decisionId}/approve`,
      {}
    );
  }

  /**
   * Refuser une décision
   */
  rejectDecision(data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/credit-requests/${data.decisionId}/reject?reason=${data.reason}`,
      {}
    );
  }

  /**
   * Marquer comme prioritaire (pas d'équivalent direct, on simule)
   */
  markAsPriority(decisionId: string): Observable<any> {
    // Simulation - dans la vraie vie, il faudrait un endpoint dédié
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Réassigner à un analyste (pas d'équivalent direct)
   */
  reassignDecision(decisionId: string, analystId: string): Observable<any> {
    // Simulation
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Générer le contrat (à implémenter côté backend)
   */
  generateContract(decisionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/credit-requests/${decisionId}/contract`, {
      responseType: 'blob'
    });
  }

  /**
   * Envoyer au client (simulation)
   */
  sendToClient(decisionId: string): Observable<any> {
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Initier un appel (simulation)
   */
  initiateAppeal(decisionId: string): Observable<any> {
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Réviser une décision
   */
  reviewDecision(decisionId: string, data: any): Observable<any> {
    // Si nouvelle décision = approve, approuver
    if (data.newDecision === 'approve') {
      return this.approveDecision({ decisionId });
    }
    // Si nouvelle décision = reject, rejeter
    if (data.newDecision === 'reject') {
      return this.rejectDecision({ decisionId, reason: data.comments || 'Révision' });
    }
    // Sinon, mettre à jour le statut
    return this.http.patch(
      `${this.apiUrl}/credit-requests/${decisionId}/status?status=UNDER_REVIEW`,
      {}
    );
  }

  // ============ MÉTHODES DE MAPPING ============

  private mapToDecisionPending(request: CreditResponseDTO): any {
    return {
      id: request.id,
      creditRequestId: request.id,
      clientName: request.clientName || 'Client',
      amount: request.amount,
      duration: request.durationMonths,
      type: request.creditTypeName || 'Crédit',
      submissionDate: new Date(request.createdAt),
      riskScore: request.riskScore || 50,
      priority: this.getPriority(request.riskScore),
      documents: 0,
      analysisProgress: this.getProgress(request.status),
      assignedAnalyst: request.analystName || 'Non assigné',
      dueDate: this.calculateDueDate(request.createdAt)
    };
  }

  private mapToDecisionApproved(request: CreditResponseDTO): any {
    return {
      id: request.id,
      creditRequestId: request.id,
      clientName: request.clientName || 'Client',
      amount: request.amount,
      duration: request.durationMonths,
      type: request.creditTypeName || 'Crédit',
      approvalDate: new Date(request.approvalDate || request.createdAt),
      approvedBy: request.analystName || 'Analyste',
      amountApproved: request.amount,
      interestRate: request.interestRate,
      monthlyPayment: request.monthlyPayment,
      status: 'approved',
      observations: request.decisionRecommendation || ''
    };
  }

  private mapToDecisionRejected(request: CreditResponseDTO): any {
    return {
      id: request.id,
      creditRequestId: request.id,
      clientName: request.clientName || 'Client',
      amount: request.amount,
      duration: request.durationMonths,
      type: request.creditTypeName || 'Crédit',
      rejectionDate: new Date(request.createdAt),
      rejectedBy: request.analystName || 'Analyste',
      reason: this.getRejectionReason(request),
      riskScore: request.riskScore || 50,
      canAppeal: true,
      appealDeadline: this.calculateAppealDeadline(request.createdAt),
      notes: request.decisionRecommendation || ''
    };
  }

  private mapToDecisionDetail(request: CreditResponseDTO): any {
    return {
      ...request,
      clientName: request.clientName || 'Client',
      submissionDate: new Date(request.createdAt)
    };
  }

  // ============ MÉTHODES UTILITAIRES ============

  private getPriority(riskScore: number): 'high' | 'medium' | 'low' {
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private getProgress(status: CreditStatus): number {
    switch(status) {
      case CreditStatus.PENDING_ANALYSIS: return 30;
      case CreditStatus.UNDER_REVIEW: return 60;
      case CreditStatus.APPROVED: return 100;
      case CreditStatus.REJECTED: return 100;
      default: return 0;
    }
  }

  private calculateDueDate(createdAt: string): Date {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 14); // +14 jours
    return date;
  }

  private calculateAppealDeadline(createdAt: string): Date {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30); // +30 jours
    return date;
  }

  private getRecommendation(simulation: any): string {
    if (simulation.riskScore >= 70) {
      return 'Ce dossier présente un bon profil de risque. Recommandation positive pour l\'approbation.';
    }
    if (simulation.riskScore >= 40) {
      return 'Ce dossier présente un risque modéré. Une analyse approfondie est recommandée.';
    }
    return 'Ce dossier présente un risque élevé. Une attention particulière est nécessaire.';
  }

  private getRiskFactors(simulation: any): string[] {
    const factors: string[] = [];
    if (simulation.debtRatio && simulation.debtRatio > 0.35) {
      factors.push('Taux d\'endettement élevé');
    }
    if (simulation.amount > 100000) {
      factors.push('Montant important');
    }
    if (simulation.durationMonths > 60) {
      factors.push('Durée longue');
    }
    return factors.length > 0 ? factors : ['Aucun facteur de risque majeur identifié'];
  }

  private getStrengths(simulation: any): string[] {
    const strengths: string[] = [];
    if (simulation.debtRatio && simulation.debtRatio < 0.25) {
      strengths.push('Taux d\'endettement faible');
    }
    if (simulation.amount < 50000) {
      strengths.push('Montant modéré');
    }
    if (simulation.durationMonths < 36) {
      strengths.push('Durée courte');
    }
    return strengths.length > 0 ? strengths : ['Profil standard'];
  }

  private getRejectionReason(request: CreditResponseDTO): string {
    if (request.rejectionReason) return request.rejectionReason;
    if (request.riskScore < 30) return 'risk_too_high';
    return 'policy_violation';
  }
}