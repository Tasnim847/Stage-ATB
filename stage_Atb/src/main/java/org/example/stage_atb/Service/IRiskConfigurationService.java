package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IRiskConfigurationService {

    // ============================================
    // 1. MODÈLES DE RISQUE
    // ============================================
    List<RiskModelResponse> getRiskModels();
    RiskModelResponse addRiskModel(RiskModelRequest request);
    RiskModelResponse updateRiskModel(String id, RiskModelRequest request);
    void deleteRiskModel(String id);
    RiskModelResponse toggleRiskModel(String id, Boolean active);

    // ============================================
    // 2. SEUILS DE RISQUE
    // ============================================
    List<RiskThresholdResponse> getRiskThresholds();
    List<RiskThresholdResponse> updateRiskThresholds(List<RiskThresholdRequest> requests);

    // ============================================
    // 3. RATIOS FINANCIERS
   // ============================================
    List<FinancialRatioResponse> getFinancialRatios();
    FinancialRatioResponse addFinancialRatio(FinancialRatioRequest request);  // ✅ AJOUTER
    FinancialRatioResponse updateFinancialRatio(String id, FinancialRatioRequest request);

    // ============================================
    // 4. RÈGLES DE DÉCISION
    // ============================================
    List<DecisionRuleResponse> getDecisionRules();
    DecisionRuleResponse addDecisionRule(DecisionRuleRequest request);
    DecisionRuleResponse updateDecisionRule(String id, DecisionRuleRequest request);
    void deleteDecisionRule(String id);
    DecisionRuleResponse toggleDecisionRule(String id, Boolean active);
    void reorderRules(List<String> ruleIds);

    // ============================================
    // 5. ALERTES
    // ============================================
    List<AlertConfigResponse> getAlertConfigs();
    AlertConfigResponse addAlertConfig(AlertConfigRequest request);
    AlertConfigResponse updateAlertConfig(String id, AlertConfigRequest request);
    void deleteAlertConfig(String id);
    AlertConfigResponse toggleAlertConfig(String id, Boolean active);

    // ============================================
    // 6. KYC / AML
    // ============================================
    List<KycAmlConfigResponse> getKycAmlConfigs();
    KycAmlConfigResponse updateKycAmlConfig(String id, KycAmlConfigRequest request);
    KycAmlConfigResponse toggleKycAmlCheck(String configId, String checkId, Boolean active);

    // Ajouter ces méthodes dans IRiskConfigurationService

    // ============================================
// 6. KYC / AML - CRUD COMPLET
// ============================================
    KycAmlConfigResponse addKycAmlConfig(KycAmlConfigRequest request);
    void deleteKycAmlConfig(String id);

    // ============================================
    // 7. IA CONFIG
    // ============================================
    AIConfigResponse getAIConfig();
    AIConfigResponse updateAIConfig(AIConfigRequest request);

    // ============================================
    // 8. FRAUDE DETECTION
    // ============================================
    List<FraudRuleResponse> getFraudRules();
    FraudRuleResponse updateFraudRule(String id, FraudRuleRequest request);
    FraudRuleResponse toggleFraudRule(String id, Boolean active);
    FraudRuleResponse addFraudRule(FraudRuleRequest request);
    void deleteFraudRule(String id);
    List<FraudRuleResponse> resetFraudRules();

    // ============================================
    // 9. EXPORT / IMPORT / RESET
    // ============================================
    ResponseEntity<Resource> exportConfiguration() throws Exception;
    void importConfiguration(MultipartFile file) throws Exception;
    void resetToDefaults();
}