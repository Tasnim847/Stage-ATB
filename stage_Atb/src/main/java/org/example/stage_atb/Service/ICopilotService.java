package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.CopilotAnalysisRequestDTO;
import org.example.stage_atb.dto.response.CopilotAnalysisResponseDTO;

import java.util.List;

public interface ICopilotService {

    /**
     * Analyse une demande de crédit avec l'IA Copilot
     * @param copilotAnalysisRequestDTO DTO contenant l'ID de la demande et la requête d'analyse
     * @return Réponse complète de l'analyse Copilot
     */
    CopilotAnalysisResponseDTO analyzeCreditRequest(CopilotAnalysisRequestDTO copilotAnalysisRequestDTO);

    /**
     * Récupère une analyse Copilot par son ID
     * @param id ID de l'analyse
     * @return DTO de l'analyse Copilot
     */
    CopilotAnalysisResponseDTO getAnalysisById(String id);

    /**
     * Récupère toutes les analyses Copilot d'un analyste
     * @param analystId ID de l'analyste
     * @return Liste des analyses Copilot
     */
    List<CopilotAnalysisResponseDTO> getAnalysesByAnalyst(String analystId);

    /**
     * Récupère toutes les analyses Copilot pour une demande de crédit
     * @param creditRequestId ID de la demande de crédit
     * @return Liste des analyses Copilot
     */
    List<CopilotAnalysisResponseDTO> getAnalysesByCreditRequest(String creditRequestId);

    /**
     * Récupère toutes les analyses Copilot
     * @return Liste de toutes les analyses Copilot
     */
    List<CopilotAnalysisResponseDTO> getAllAnalyses();

    /**
     * Récupère les analyses Copilot les plus récentes
     * @param limit Nombre maximum d'analyses à récupérer
     * @return Liste des analyses récentes
     */
    List<CopilotAnalysisResponseDTO> getLatestAnalyses(int limit);

    /**
     * Récupère les analyses Copilot à haut risque
     * @return Liste des analyses à haut risque
     */
    List<CopilotAnalysisResponseDTO> getHighRiskAnalyses();

    /**
     * Récupère les analyses Copilot par niveau de risque
     * @param riskLevel Niveau de risque (LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL)
     * @return Liste des analyses par niveau de risque
     */
    List<CopilotAnalysisResponseDTO> getAnalysesByRiskLevel(String riskLevel);

    /**
     * Met à jour une analyse Copilot
     * @param id ID de l'analyse
     * @param copilotAnalysisRequestDTO DTO avec les nouvelles données
     * @return Analyse Copilot mise à jour
     */
    CopilotAnalysisResponseDTO updateAnalysis(String id, CopilotAnalysisRequestDTO copilotAnalysisRequestDTO);

    /**
     * Supprime une analyse Copilot
     * @param id ID de l'analyse à supprimer
     */
    void deleteAnalysis(String id);

    /**
     * Génère un rapport stratégique automatique pour la banque
     * @return Rapport stratégique généré par IA
     */
    String generateStrategicReport();

    /**
     * Génère un rapport stratégique pour une date spécifique
     * @param date Date du rapport
     * @return Rapport stratégique généré par IA
     */
    String generateStrategicReportForDate(String date);

    /**
     * Analyse instantanée d'un dossier avec explications des risques
     * @param creditRequestId ID de la demande de crédit
     * @return Analyse instantanée avec explications
     */
    CopilotAnalysisResponseDTO getInstantAnalysis(String creditRequestId);

    /**
     * Obtient des suggestions d'actions pour un analyste
     * @param creditRequestId ID de la demande de crédit
     * @return Liste des suggestions d'actions
     */
    List<String> getActionSuggestions(String creditRequestId);

    /**
     * Génère une réponse en langage naturel pour une requête
     * @param query Question ou requête de l'utilisateur
     * @param creditRequestId ID de la demande de crédit (optionnel)
     * @return Réponse en langage naturel
     */
    String getNaturalLanguageResponse(String query, String creditRequestId);

    /**
     * Récupère le nombre total d'analyses Copilot
     * @return Nombre total d'analyses
     */
    long countTotalAnalyses();

    /**
     * Récupère le nombre d'analyses Copilot par analyste
     * @param analystId ID de l'analyste
     * @return Nombre d'analyses
     */
    long countAnalysesByAnalyst(String analystId);

    /**
     * Vérifie si une analyse Copilot existe
     * @param id ID de l'analyse
     * @return true si l'analyse existe, false sinon
     */
    boolean existsById(String id);

    /**
     * Analyse un dossier et donne un avis complet avec :
     * - Niveau de risque
     * - Taux d'endettement
     * - Stabilité des revenus
     * - Recommandation de crédit
     * - Suggestions de garanties
     * @param creditRequestId ID de la demande de crédit
     * @return Analyse complète du dossier
     */
    CopilotAnalysisResponseDTO getFullDossierAnalysis(String creditRequestId);

    /**
     * Génère un rapport de synthèse exécutive pour les responsables
     * @return Rapport de synthèse exécutive
     */
    String generateExecutiveSummary();

    /**
     * Récupère toutes les analyses Copilot premium
     * @return Liste des analyses premium
     */
    List<CopilotAnalysisResponseDTO> getPremiumAnalyses();

    /**
     * Active ou désactive le mode premium pour une analyse
     * @param id ID de l'analyse
     * @param enabled true pour activer, false pour désactiver
     * @return Analyse mise à jour
     */
    CopilotAnalysisResponseDTO togglePremiumMode(String id, boolean enabled);
}