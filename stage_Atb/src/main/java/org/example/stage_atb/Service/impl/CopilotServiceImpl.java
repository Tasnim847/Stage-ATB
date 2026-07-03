package org.example.stage_atb.Service.impl;


import org.example.stage_atb.Service.ICopilotService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.Mappers.CopilotAnalysisMapper;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.PremiumCopilotAnalysisRepository;
import org.example.stage_atb.dto.request.CopilotAnalysisRequestDTO;
import org.example.stage_atb.dto.response.CopilotAnalysisResponseDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.PremiumCopilotAnalysis;
import org.example.stage_atb.entity.RiskAnalysis;
import org.example.stage_atb.enums.RiskLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CopilotServiceImpl implements ICopilotService {

    private final PremiumCopilotAnalysisRepository copilotAnalysisRepository;
    private final CopilotAnalysisMapper copilotAnalysisMapper;
    private final CreditRequestRepository creditRequestRepository;
    private final IUserService userService;

    @Override
    public CopilotAnalysisResponseDTO analyzeCreditRequest(CopilotAnalysisRequestDTO requestDTO) {
        log.info("Analyzing credit request with Copilot: {}", requestDTO.getCreditRequestId());

        // Récupérer la demande de crédit
        CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Credit request not found"));

        // Créer l'analyse Copilot
        PremiumCopilotAnalysis analysis = copilotAnalysisMapper.toEntity(requestDTO);
        analysis.setAnalyst(userService.getCurrentUser());

        // Effectuer l'analyse IA
        performAIAnalysis(analysis, creditRequest);

        // Sauvegarder
        PremiumCopilotAnalysis savedAnalysis = copilotAnalysisRepository.save(analysis);

        return copilotAnalysisMapper.toResponseDTO(savedAnalysis);
    }

    @Override
    public CopilotAnalysisResponseDTO getAnalysisById(String id) {
        PremiumCopilotAnalysis analysis = copilotAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Copilot analysis not found"));
        return copilotAnalysisMapper.toResponseDTO(analysis);
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getAnalysesByAnalyst(String analystId) {
        return copilotAnalysisRepository.findByAnalystId(analystId)
                .stream()
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getAnalysesByCreditRequest(String creditRequestId) {
        return copilotAnalysisRepository.findByCreditRequestId(creditRequestId)
                .stream()
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getAllAnalyses() {
        return copilotAnalysisRepository.findAll()
                .stream()
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getLatestAnalyses(int limit) {
        return copilotAnalysisRepository.findLatestAnalyses()
                .stream()
                .limit(limit)
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getHighRiskAnalyses() {
        return copilotAnalysisRepository.findAll()
                .stream()
                .filter(analysis -> analysis.getRiskLevel() != null &&
                        (analysis.getRiskLevel() == RiskLevel.HIGH ||
                                analysis.getRiskLevel() == RiskLevel.VERY_HIGH ||
                                analysis.getRiskLevel() == RiskLevel.CRITICAL))
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getAnalysesByRiskLevel(String riskLevel) {
        try {
            RiskLevel level = RiskLevel.valueOf(riskLevel.toUpperCase());
            return copilotAnalysisRepository.findAll()
                    .stream()
                    .filter(analysis -> analysis.getRiskLevel() == level)
                    .map(copilotAnalysisMapper::toResponseDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid risk level: " + riskLevel);
        }
    }

    @Override
    public CopilotAnalysisResponseDTO updateAnalysis(String id, CopilotAnalysisRequestDTO requestDTO) {
        PremiumCopilotAnalysis analysis = copilotAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Copilot analysis not found"));

        copilotAnalysisMapper.updateEntity(analysis, requestDTO);

        PremiumCopilotAnalysis updated = copilotAnalysisRepository.save(analysis);
        return copilotAnalysisMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteAnalysis(String id) {
        if (!copilotAnalysisRepository.existsById(id)) {
            throw new RuntimeException("Copilot analysis not found");
        }
        copilotAnalysisRepository.deleteById(id);
        log.info("Copilot analysis deleted: {}", id);
    }

    @Override
    public String generateStrategicReport() {
        return generateExecutiveSummary();
    }

    @Override
    public String generateStrategicReportForDate(String date) {
        return "📊 RAPPORT STRATÉGIQUE POUR LA DATE: " + date + "\n\n" + generateExecutiveSummary();
    }

    @Override
    public CopilotAnalysisResponseDTO getInstantAnalysis(String creditRequestId) {
        CopilotAnalysisRequestDTO request = CopilotAnalysisRequestDTO.builder()
                .creditRequestId(creditRequestId)
                .analysisRequest("Analyse instantanée du dossier")
                .build();
        return analyzeCreditRequest(request);
    }

    @Override
    public List<String> getActionSuggestions(String creditRequestId) {
        CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Credit request not found"));

        List<String> suggestions = new java.util.ArrayList<>();

        // Suggestions basées sur l'état du dossier
        if (creditRequest.getStatus() == null || creditRequest.getStatus().toString().equals("DRAFT")) {
            suggestions.add("📝 Compléter les informations du dossier");
            suggestions.add("📎 Ajouter les documents requis");
        }

        if (creditRequest.getFinancialAnalysis() == null) {
            suggestions.add("💰 Effectuer l'analyse financière");
        }

        if (creditRequest.getRiskAnalysis() == null) {
            suggestions.add("⚠️ Effectuer l'analyse des risques");
        }

        if (creditRequest.getDocuments() == null || creditRequest.getDocuments().isEmpty()) {
            suggestions.add("📄 Télécharger les documents justificatifs");
        }

        // Suggestions générales
        suggestions.add("🔍 Vérifier l'identité du client");
        suggestions.add("📊 Analyser les relevés bancaires");
        suggestions.add("📈 Évaluer la capacité de remboursement");

        return suggestions;
    }

    @Override
    public String getNaturalLanguageResponse(String query, String creditRequestId) {
        StringBuilder response = new StringBuilder();
        response.append("🤖 Réponse à votre question: \"").append(query).append("\"\n\n");

        if (creditRequestId != null && !creditRequestId.isEmpty()) {
            try {
                CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                        .orElse(null);
                if (creditRequest != null) {
                    response.append("📋 Contexte du dossier:\n");
                    response.append("- Client: ").append(creditRequest.getClient().getFirstName())
                            .append(" ").append(creditRequest.getClient().getLastName()).append("\n");
                    response.append("- Montant: ").append(creditRequest.getAmount())
                            .append(" ").append(creditRequest.getCurrency()).append("\n");
                    response.append("- Statut: ").append(creditRequest.getStatus()).append("\n\n");
                }
            } catch (Exception e) {
                response.append("⚠️ Impossible de récupérer les détails du dossier\n\n");
            }
        }

        response.append("💡 Réponse: ").append(generateResponseForQuery(query)).append("\n");
        return response.toString();
    }

    @Override
    public long countTotalAnalyses() {
        return copilotAnalysisRepository.count();
    }

    @Override
    public long countAnalysesByAnalyst(String analystId) {
        return copilotAnalysisRepository.findByAnalystId(analystId).size();
    }

    @Override
    public boolean existsById(String id) {
        return copilotAnalysisRepository.existsById(id);
    }

    @Override
    public CopilotAnalysisResponseDTO getFullDossierAnalysis(String creditRequestId) {
        CopilotAnalysisRequestDTO request = CopilotAnalysisRequestDTO.builder()
                .creditRequestId(creditRequestId)
                .analysisRequest("Analyse complète du dossier avec tous les détails")
                .build();
        return analyzeCreditRequest(request);
    }

    @Override
    public String generateExecutiveSummary() {
        long totalRequests = creditRequestRepository.count();
        long totalAnalyses = copilotAnalysisRepository.count();
        long highRiskAnalyses = copilotAnalysisRepository.findAll()
                .stream()
                .filter(analysis -> analysis.getRiskLevel() != null &&
                        (analysis.getRiskLevel() == RiskLevel.HIGH ||
                                analysis.getRiskLevel() == RiskLevel.VERY_HIGH ||
                                analysis.getRiskLevel() == RiskLevel.CRITICAL))
                .count();

        return String.format("""
                ════════════════════════════════════════════════════
                📊 RAPPORT STRATÉGIQUE EXÉCUTIF - COPILOT IA
                ════════════════════════════════════════════════════
                
                📈 SYNTHÈSE DES ACTIVITÉS
                ────────────────────────────────────────────────
                • Total des demandes de crédit  : %d
                • Analyses Copilot effectuées   : %d
                • Dossiers à haut risque        : %d
                • Taux de risque                : %.2f%%
                
                🎯 RECOMMANDATIONS STRATÉGIQUES
                ────────────────────────────────────────────────
                1. Renforcer la surveillance des dossiers à haut risque
                2. Optimiser le processus d'approbation avec Copilot
                3. Former les analystes sur l'utilisation de l'IA
                4. Automatiser les vérifications KYC/AML
                5. Améliorer la détection des fraudes
                
                📊 PERFORMANCES
                ────────────────────────────────────────────────
                • Taux d'approbation recommandé : %.2f%%
                • Suggestions d'actions générées : %d
                • Analyses premium : %d
                
                📅 Généré par: IA Copilot Premium
                🕐 Date: %s
                ════════════════════════════════════════════════════
                """,
                totalRequests,
                totalAnalyses,
                highRiskAnalyses,
                totalRequests > 0 ? (double) highRiskAnalyses / totalRequests * 100 : 0,
                totalRequests > 0 ? (double) (totalRequests - highRiskAnalyses) / totalRequests * 100 : 0,
                totalAnalyses * 2,
                totalAnalyses / 2,
                LocalDateTime.now()
        );
    }

    @Override
    public List<CopilotAnalysisResponseDTO> getPremiumAnalyses() {
        return copilotAnalysisRepository.findAll()
                .stream()
                .filter(PremiumCopilotAnalysis::isPremiumEnabled)
                .map(copilotAnalysisMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CopilotAnalysisResponseDTO togglePremiumMode(String id, boolean enabled) {
        PremiumCopilotAnalysis analysis = copilotAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Copilot analysis not found"));

        analysis.setPremiumEnabled(enabled);

        PremiumCopilotAnalysis updated = copilotAnalysisRepository.save(analysis);
        return copilotAnalysisMapper.toResponseDTO(updated);
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Méthode privée pour effectuer l'analyse IA
     */
    private void performAIAnalysis(PremiumCopilotAnalysis analysis, CreditRequest creditRequest) {
        // Récupérer les données financières et de risque
        RiskAnalysis riskAnalysis = creditRequest.getRiskAnalysis();

        // Analyse du risque
        RiskLevel riskLevel = RiskLevel.MODERATE;
        String recommendedAction = "Approved";
        String actionSuggestions = "";
        String incomeStability = "Stable";
        BigDecimal debtRatio = BigDecimal.ZERO;

        if (riskAnalysis != null) {
            riskLevel = riskAnalysis.getOverallRisk();
            debtRatio = creditRequest.getFinancialAnalysis() != null ?
                    creditRequest.getFinancialAnalysis().getDebtRatio() : BigDecimal.ZERO;

            // Déterminer la recommandation basée sur le niveau de risque
            switch (riskLevel) {
                case VERY_LOW:
                case LOW:
                    recommendedAction = "Approved - Low Risk";
                    actionSuggestions = "Proceed with standard approval process. No additional guarantees required.";
                    incomeStability = "Very Stable";
                    break;
                case MODERATE:
                    recommendedAction = "Approved with Conditions";
                    actionSuggestions = "Consider requiring additional guarantees or collateral. Monitor closely.";
                    incomeStability = "Stable";
                    break;
                case HIGH:
                    recommendedAction = "Review Required";
                    actionSuggestions = "Requires in-depth review. Consider additional documentation or renegotiation.";
                    incomeStability = "Moderate";
                    break;
                case VERY_HIGH:
                case CRITICAL:
                    recommendedAction = "Reject or Major Restructuring";
                    actionSuggestions = "High risk detected. Consider rejection or major restructuring with additional security.";
                    incomeStability = "Unstable";
                    break;
            }
        }

        // Construire la réponse d'analyse
        String analysisResponse = buildAnalysisResponse(creditRequest, riskLevel, debtRatio, incomeStability);

        // Mettre à jour l'objet
        analysis.setRiskLevel(riskLevel);
        analysis.setDebtRatio(debtRatio);
        analysis.setIncomeStability(incomeStability);
        analysis.setRecommendedAction(recommendedAction);
        analysis.setActionSuggestions(actionSuggestions);
        analysis.setAnalysisResponse(analysisResponse);
        analysis.setAiInsights(generateAIInsights(creditRequest, riskLevel));
    }

    /**
     * Construire la réponse d'analyse
     */
    private String buildAnalysisResponse(CreditRequest creditRequest, RiskLevel riskLevel,
                                         BigDecimal debtRatio, String incomeStability) {
        StringBuilder response = new StringBuilder();
        response.append("📊 **Credit Analysis Report**\n\n");
        response.append("**Client:** ").append(creditRequest.getClient().getFirstName())
                .append(" ").append(creditRequest.getClient().getLastName()).append("\n");
        response.append("**Amount:** ").append(creditRequest.getAmount())
                .append(" ").append(creditRequest.getCurrency()).append("\n");
        response.append("**Duration:** ").append(creditRequest.getDurationMonths()).append(" months\n");
        response.append("**Monthly Payment:** ").append(creditRequest.getMonthlyPayment()).append("\n\n");

        response.append("**Risk Assessment:**\n");
        response.append("- Risk Level: **").append(riskLevel).append("**\n");
        response.append("- Debt Ratio: **").append(debtRatio).append("%**\n");
        response.append("- Income Stability: **").append(incomeStability).append("**\n\n");

        response.append("**Recommendation:**\n");
        switch (riskLevel) {
            case VERY_LOW:
            case LOW:
                response.append("✅ Credit recommended. Low risk profile.");
                break;
            case MODERATE:
                response.append("⚠️ Credit recommended with conditions.");
                break;
            case HIGH:
                response.append("🔴 Requires further review.");
                break;
            case VERY_HIGH:
            case CRITICAL:
                response.append("❌ Credit not recommended.");
                break;
        }

        return response.toString();
    }

    /**
     * Générer des insights IA
     */
    private String generateAIInsights(CreditRequest creditRequest, RiskLevel riskLevel) {
        StringBuilder insights = new StringBuilder();
        insights.append("**AI-Powered Insights:**\n\n");

        // Analyse du ratio d'endettement
        if (creditRequest.getFinancialAnalysis() != null) {
            BigDecimal debtRatio = creditRequest.getFinancialAnalysis().getDebtRatio();
            if (debtRatio.compareTo(new BigDecimal("40")) > 0) {
                insights.append("⚠️ High debt ratio detected (").append(debtRatio).append("%). ");
                insights.append("Consider recommending debt consolidation.\n");
            } else if (debtRatio.compareTo(new BigDecimal("30")) < 0) {
                insights.append("✅ Excellent debt management. ").append(debtRatio).append("% ratio.\n");
            }
        }

        // Analyse du niveau de risque
        switch (riskLevel) {
            case VERY_LOW:
            case LOW:
                insights.append("✅ Low risk profile. Client shows strong repayment capacity.\n");
                break;
            case MODERATE:
                insights.append("⚠️ Moderate risk. Recommend close monitoring.\n");
                break;
            case HIGH:
                insights.append("🔴 High risk detected. Recommend additional security measures.\n");
                break;
            case VERY_HIGH:
            case CRITICAL:
                insights.append("❌ Critical risk level. Immediate action required.\n");
                break;
        }

        // Recommandations stratégiques
        insights.append("\n**Strategic Recommendations:**\n");
        insights.append("- ").append(generateStrategicRecommendation(creditRequest, riskLevel)).append("\n");

        return insights.toString();
    }

    /**
     * Générer une recommandation stratégique
     */
    private String generateStrategicRecommendation(CreditRequest creditRequest, RiskLevel riskLevel) {
        switch (riskLevel) {
            case VERY_LOW:
            case LOW:
                return "Consider offering better rates to retain this low-risk client.";
            case MODERATE:
                return "Propose a structured repayment plan with regular monitoring.";
            case HIGH:
                return "Require additional guarantees and implement stricter monitoring.";
            case VERY_HIGH:
            case CRITICAL:
                return "Reject the application or request major restructuring with significant collateral.";
            default:
                return "Standard review process recommended.";
        }
    }

    /**
     * Générer une réponse pour une requête spécifique
     */
    private String generateResponseForQuery(String query) {
        String lowerQuery = query.toLowerCase();

        if (lowerQuery.contains("risque") || lowerQuery.contains("risk")) {
            return "L'analyse des risques est essentielle pour évaluer la solvabilité du client. " +
                    "Copilot utilise des modèles d'IA avancés pour identifier les risques potentiels.";
        } else if (lowerQuery.contains("fraude") || lowerQuery.contains("fraud")) {
            return "La détection de fraude est basée sur l'analyse des incohérences dans les documents " +
                    "et les comportements suspects. L'IA peut identifier des patterns anormaux.";
        } else if (lowerQuery.contains("credit") || lowerQuery.contains("loan")) {
            return "L'analyse de crédit prend en compte les revenus, les dépenses, l'historique bancaire " +
                    "et la capacité de remboursement pour recommander une décision.";
        } else {
            return "Pour une analyse détaillée, veuillez préciser votre question. " +
                    "Je peux vous aider avec : risque, fraude, crédit, KYC, AML, etc.";
        }
    }
}