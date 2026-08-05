package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IRiskConfigurationService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RiskConfigurationController {

    private final IRiskConfigurationService riskConfigurationService;

    // ============================================
    // 1. MODÈLES DE RISQUE
    // ============================================

    @GetMapping("/models")
    public ResponseEntity<List<RiskModelResponse>> getRiskModels() {
        log.info("📋 GET /api/risk/models - Récupération des modèles de risque");
        return ResponseEntity.ok(riskConfigurationService.getRiskModels());
    }

    @PostMapping("/models")
    public ResponseEntity<RiskModelResponse> addRiskModel(
            @Valid @RequestBody RiskModelRequest request) {
        log.info("➕ POST /api/risk/models - Création d'un modèle de risque: {}", request.getName());
        RiskModelResponse response = riskConfigurationService.addRiskModel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/models/{id}")
    public ResponseEntity<RiskModelResponse> updateRiskModel(
            @PathVariable String id,
            @Valid @RequestBody RiskModelRequest request) {
        log.info("✏️ PUT /api/risk/models/{} - Mise à jour du modèle", id);
        return ResponseEntity.ok(riskConfigurationService.updateRiskModel(id, request));
    }

    @DeleteMapping("/models/{id}")
    public ResponseEntity<Void> deleteRiskModel(@PathVariable String id) {
        log.info("🗑️ DELETE /api/risk/models/{} - Suppression du modèle", id);
        riskConfigurationService.deleteRiskModel(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/models/{id}/toggle")
    public ResponseEntity<RiskModelResponse> toggleRiskModel(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        log.info("🔄 PATCH /api/risk/models/{}/toggle - Basculement du modèle: {}", id, active);
        return ResponseEntity.ok(riskConfigurationService.toggleRiskModel(id, active));
    }

    // ============================================
    // 2. SEUILS DE RISQUE
    // ============================================

    @GetMapping("/thresholds")
    public ResponseEntity<List<RiskThresholdResponse>> getRiskThresholds() {
        log.info("📋 GET /api/risk/thresholds - Récupération des seuils de risque");
        return ResponseEntity.ok(riskConfigurationService.getRiskThresholds());
    }

    @PutMapping("/thresholds")
    public ResponseEntity<List<RiskThresholdResponse>> updateRiskThresholds(
            @Valid @RequestBody List<RiskThresholdRequest> requests) {
        log.info("✏️ PUT /api/risk/thresholds - Mise à jour des seuils de risque");
        return ResponseEntity.ok(riskConfigurationService.updateRiskThresholds(requests));
    }

    // ============================================
    // 3. RATIOS FINANCIERS
    // ============================================

    @GetMapping("/ratios")
    public ResponseEntity<List<FinancialRatioResponse>> getFinancialRatios() {
        log.info("📋 GET /api/risk/ratios - Récupération des ratios financiers");
        return ResponseEntity.ok(riskConfigurationService.getFinancialRatios());
    }

    @PutMapping("/ratios/{id}")
    public ResponseEntity<FinancialRatioResponse> updateFinancialRatio(
            @PathVariable String id,
            @Valid @RequestBody FinancialRatioRequest request) {
        log.info("✏️ PUT /api/risk/ratios/{} - Mise à jour du ratio", id);
        return ResponseEntity.ok(riskConfigurationService.updateFinancialRatio(id, request));
    }

    // ============================================
    // 4. RÈGLES DE DÉCISION
    // ============================================

    @GetMapping("/rules")
    public ResponseEntity<List<DecisionRuleResponse>> getDecisionRules() {
        log.info("📋 GET /api/risk/rules - Récupération des règles de décision");
        return ResponseEntity.ok(riskConfigurationService.getDecisionRules());
    }

    @PostMapping("/rules")
    public ResponseEntity<DecisionRuleResponse> addDecisionRule(
            @Valid @RequestBody DecisionRuleRequest request) {
        log.info("➕ POST /api/risk/rules - Création d'une règle: {}", request.getName());
        DecisionRuleResponse response = riskConfigurationService.addDecisionRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<DecisionRuleResponse> updateDecisionRule(
            @PathVariable String id,
            @Valid @RequestBody DecisionRuleRequest request) {
        log.info("✏️ PUT /api/risk/rules/{} - Mise à jour de la règle", id);
        return ResponseEntity.ok(riskConfigurationService.updateDecisionRule(id, request));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteDecisionRule(@PathVariable String id) {
        log.info("🗑️ DELETE /api/risk/rules/{} - Suppression de la règle", id);
        riskConfigurationService.deleteDecisionRule(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/rules/{id}/toggle")
    public ResponseEntity<DecisionRuleResponse> toggleDecisionRule(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        log.info("🔄 PATCH /api/risk/rules/{}/toggle - Basculement de la règle: {}", id, active);
        return ResponseEntity.ok(riskConfigurationService.toggleDecisionRule(id, active));
    }

    @PostMapping("/rules/reorder")
    public ResponseEntity<Void> reorderRules(@RequestBody Map<String, List<String>> payload) {
        List<String> ruleIds = payload.get("ruleIds");
        log.info("🔄 POST /api/risk/rules/reorder - Réorganisation des règles: {}", ruleIds);
        riskConfigurationService.reorderRules(ruleIds);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // 5. ALERTES
    // ============================================

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertConfigResponse>> getAlertConfigs() {
        log.info("📋 GET /api/risk/alerts - Récupération des alertes");
        return ResponseEntity.ok(riskConfigurationService.getAlertConfigs());
    }

    @PostMapping("/alerts")
    public ResponseEntity<AlertConfigResponse> addAlertConfig(
            @Valid @RequestBody AlertConfigRequest request) {
        log.info("➕ POST /api/risk/alerts - Création d'une alerte: {}", request.getEvent());
        AlertConfigResponse response = riskConfigurationService.addAlertConfig(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/alerts/{id}")
    public ResponseEntity<AlertConfigResponse> updateAlertConfig(
            @PathVariable String id,
            @Valid @RequestBody AlertConfigRequest request) {
        log.info("✏️ PUT /api/risk/alerts/{} - Mise à jour de l'alerte", id);
        return ResponseEntity.ok(riskConfigurationService.updateAlertConfig(id, request));
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<Void> deleteAlertConfig(@PathVariable String id) {
        log.info("🗑️ DELETE /api/risk/alerts/{} - Suppression de l'alerte", id);
        riskConfigurationService.deleteAlertConfig(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/alerts/{id}/toggle")
    public ResponseEntity<AlertConfigResponse> toggleAlertConfig(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        log.info("🔄 PATCH /api/risk/alerts/{}/toggle - Basculement de l'alerte: {}", id, active);
        return ResponseEntity.ok(riskConfigurationService.toggleAlertConfig(id, active));
    }

    // ============================================
    // 6. KYC / AML
    // ============================================

    @GetMapping("/kyc-aml")
    public ResponseEntity<List<KycAmlConfigResponse>> getKycAmlConfigs() {
        log.info("📋 GET /api/risk/kyc-aml - Récupération des configurations KYC/AML");
        return ResponseEntity.ok(riskConfigurationService.getKycAmlConfigs());
    }

    @PutMapping("/kyc-aml/{id}")
    public ResponseEntity<KycAmlConfigResponse> updateKycAmlConfig(
            @PathVariable String id,
            @Valid @RequestBody KycAmlConfigRequest request) {
        log.info("✏️ PUT /api/risk/kyc-aml/{} - Mise à jour de la configuration KYC/AML", id);
        return ResponseEntity.ok(riskConfigurationService.updateKycAmlConfig(id, request));
    }

    @PatchMapping("/kyc-aml/{configId}/checks/{checkId}")
    public ResponseEntity<KycAmlConfigResponse> toggleKycAmlCheck(
            @PathVariable String configId,
            @PathVariable String checkId,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        log.info("🔄 PATCH /api/risk/kyc-aml/{}/checks/{} - Basculement du check: {}", configId, checkId, active);
        return ResponseEntity.ok(riskConfigurationService.toggleKycAmlCheck(configId, checkId, active));
    }

    // ============================================
    // 7. IA CONFIG
    // ============================================

    // ============================================
// 7. IA CONFIG
// ============================================

    @GetMapping("/ai-config")
    public ResponseEntity<AIConfigResponse> getAIConfig() {
        log.info("📋 GET /api/risk/ai-config - Récupération de la configuration IA");
        AIConfigResponse response = riskConfigurationService.getAIConfig();
        if (response == null) {
            // ✅ Créer une configuration par défaut si elle n'existe pas
            AIConfigRequest defaultRequest = new AIConfigRequest();
            defaultRequest.setProvider("OpenAI");
            defaultRequest.setModel("gpt-4");
            defaultRequest.setTemperature(0.7);
            defaultRequest.setSystemPrompt("Vous êtes un expert en analyse de risque bancaire. Analysez les données fournies et fournissez une évaluation précise du risque.");
            defaultRequest.setLanguage("fr");
            defaultRequest.setMinScore(0);
            defaultRequest.setExplanationRequired(true);
            defaultRequest.setIsActive(true);
            response = riskConfigurationService.updateAIConfig(defaultRequest);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/ai-config")
    public ResponseEntity<AIConfigResponse> updateAIConfig(
            @Valid @RequestBody AIConfigRequest request) {
        log.info("✏️ PUT /api/risk/ai-config - Mise à jour de la configuration IA");
        return ResponseEntity.ok(riskConfigurationService.updateAIConfig(request));
    }
    
    // ============================================
    // 8. FRAUDE DETECTION
    // ============================================

    @GetMapping("/fraud-rules")
    public ResponseEntity<List<FraudRuleResponse>> getFraudRules() {
        log.info("📋 GET /api/risk/fraud-rules - Récupération des règles de fraude");
        return ResponseEntity.ok(riskConfigurationService.getFraudRules());
    }

    @PutMapping("/fraud-rules/{id}")
    public ResponseEntity<FraudRuleResponse> updateFraudRule(
            @PathVariable String id,
            @Valid @RequestBody FraudRuleRequest request) {
        log.info("✏️ PUT /api/risk/fraud-rules/{} - Mise à jour de la règle de fraude", id);
        return ResponseEntity.ok(riskConfigurationService.updateFraudRule(id, request));
    }

    @PatchMapping("/fraud-rules/{id}/toggle")
    public ResponseEntity<FraudRuleResponse> toggleFraudRule(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        log.info("🔄 PATCH /api/risk/fraud-rules/{}/toggle - Basculement de la règle de fraude: {}", id, active);
        return ResponseEntity.ok(riskConfigurationService.toggleFraudRule(id, active));
    }

    // ============================================
    // 9. EXPORT / IMPORT / RESET
    // ============================================

    @GetMapping("/export")
    public ResponseEntity<Resource> exportConfiguration() throws Exception {
        log.info("📤 GET /api/risk/export - Export de la configuration");
        return riskConfigurationService.exportConfiguration();
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importConfiguration(
            @RequestParam("file") MultipartFile file) throws Exception {
        log.info("📥 POST /api/risk/import - Import de la configuration");
        riskConfigurationService.importConfiguration(file);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetToDefaults() {
        log.info("🔄 POST /api/risk/reset - Réinitialisation de la configuration");
        riskConfigurationService.resetToDefaults();
        return ResponseEntity.ok().build();
    }
}