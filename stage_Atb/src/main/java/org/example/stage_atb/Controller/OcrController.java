package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.Service.IOcrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class OcrController {

    private final IOcrService ocrService;

    // ============================================
    // CONFIGURATION
    // ============================================

    @GetMapping("/config")
    public ResponseEntity<OcrConfigResponse> getConfig() {
        log.info("GET /api/ocr/config");
        return ResponseEntity.ok(ocrService.getConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<OcrConfigResponse> updateConfig(
            @Valid @RequestBody OcrConfigRequest request) {
        log.info("PUT /api/ocr/config");
        return ResponseEntity.ok(ocrService.updateConfig(request));
    }

    @PostMapping("/test")
    public ResponseEntity<OcrConnectionStatusResponse> testConnection() {
        log.info("POST /api/ocr/test");
        return ResponseEntity.ok(ocrService.testConnection());
    }

    // ============================================
    // DOCUMENT TYPES
    // ============================================

    @GetMapping("/document-types")
    public ResponseEntity<List<OcrDocumentTypeResponse>> getDocumentTypes() {
        log.info("GET /api/ocr/document-types");
        return ResponseEntity.ok(ocrService.getDocumentTypes());
    }

    @GetMapping("/document-types/{id}")
    public ResponseEntity<OcrDocumentTypeResponse> getDocumentType(@PathVariable Long id) {
        log.info("GET /api/ocr/document-types/{}", id);
        return ResponseEntity.ok(ocrService.getDocumentType(id));
    }

    @PostMapping("/document-types")
    public ResponseEntity<OcrDocumentTypeResponse> addDocumentType(
            @Valid @RequestBody OcrDocumentTypeRequest request) {
        log.info("POST /api/ocr/document-types");
        return ResponseEntity.ok(ocrService.addDocumentType(request));
    }

    @PutMapping("/document-types/{id}")
    public ResponseEntity<OcrDocumentTypeResponse> updateDocumentType(
            @PathVariable Long id,
            @Valid @RequestBody OcrDocumentTypeRequest request) {
        log.info("PUT /api/ocr/document-types/{}", id);
        return ResponseEntity.ok(ocrService.updateDocumentType(id, request));
    }

    @DeleteMapping("/document-types/{id}")
    public ResponseEntity<Void> deleteDocumentType(@PathVariable Long id) {
        log.info("DELETE /api/ocr/document-types/{}", id);
        ocrService.deleteDocumentType(id);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // FIELDS
    // ============================================

    @GetMapping("/document-types/{documentTypeId}/fields")
    public ResponseEntity<List<OcrFieldResponse>> getFields(@PathVariable Long documentTypeId) {
        log.info("GET /api/ocr/document-types/{}/fields", documentTypeId);
        return ResponseEntity.ok(ocrService.getFields(documentTypeId));
    }

    @PostMapping("/document-types/{documentTypeId}/fields")
    public ResponseEntity<OcrFieldResponse> addField(
            @PathVariable Long documentTypeId,
            @Valid @RequestBody OcrFieldRequest request) {
        log.info("POST /api/ocr/document-types/{}/fields", documentTypeId);
        return ResponseEntity.ok(ocrService.addField(documentTypeId, request));
    }

    @PutMapping("/document-types/{documentTypeId}/fields/{fieldId}")
    public ResponseEntity<OcrFieldResponse> updateField(
            @PathVariable Long documentTypeId,
            @PathVariable Long fieldId,
            @Valid @RequestBody OcrFieldRequest request) {
        log.info("PUT /api/ocr/document-types/{}/fields/{}", documentTypeId, fieldId);
        return ResponseEntity.ok(ocrService.updateField(documentTypeId, fieldId, request));
    }

    @DeleteMapping("/document-types/{documentTypeId}/fields/{fieldId}")
    public ResponseEntity<Void> deleteField(
            @PathVariable Long documentTypeId,
            @PathVariable Long fieldId) {
        log.info("DELETE /api/ocr/document-types/{}/fields/{}", documentTypeId, fieldId);
        ocrService.deleteField(documentTypeId, fieldId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // VALIDATION RULES
    // ============================================

    @GetMapping("/document-types/{documentTypeId}/rules")
    public ResponseEntity<List<ValidationRuleResponse>> getValidationRules(
            @PathVariable Long documentTypeId) {
        log.info("GET /api/ocr/document-types/{}/rules", documentTypeId);
        return ResponseEntity.ok(ocrService.getValidationRules(documentTypeId));
    }

    @PostMapping("/document-types/{documentTypeId}/rules")
    public ResponseEntity<ValidationRuleResponse> addValidationRule(
            @PathVariable Long documentTypeId,
            @Valid @RequestBody ValidationRuleRequest request) {
        log.info("POST /api/ocr/document-types/{}/rules", documentTypeId);
        return ResponseEntity.ok(ocrService.addValidationRule(documentTypeId, request));
    }

    @PutMapping("/document-types/{documentTypeId}/rules/{ruleId}")
    public ResponseEntity<ValidationRuleResponse> updateValidationRule(
            @PathVariable Long documentTypeId,
            @PathVariable Long ruleId,
            @Valid @RequestBody ValidationRuleRequest request) {
        log.info("PUT /api/ocr/document-types/{}/rules/{}", documentTypeId, ruleId);
        return ResponseEntity.ok(ocrService.updateValidationRule(documentTypeId, ruleId, request));
    }

    @DeleteMapping("/document-types/{documentTypeId}/rules/{ruleId}")
    public ResponseEntity<Void> deleteValidationRule(
            @PathVariable Long documentTypeId,
            @PathVariable Long ruleId) {
        log.info("DELETE /api/ocr/document-types/{}/rules/{}", documentTypeId, ruleId);
        ocrService.deleteValidationRule(documentTypeId, ruleId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // LOGS
    // ============================================

    @GetMapping("/logs")
    public ResponseEntity<Page<OcrLogResponse>> getOcrLogs(
            @RequestParam(required = false) String result,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("GET /api/ocr/logs");
        return ResponseEntity.ok(ocrService.getOcrLogs(result, pageable));
    }

    @GetMapping("/logs/{id}")
    public ResponseEntity<OcrLogResponse> getOcrLog(@PathVariable Long id) {
        log.info("GET /api/ocr/logs/{}", id);
        return ResponseEntity.ok(ocrService.getOcrLog(id));
    }

    @DeleteMapping("/logs")
    public ResponseEntity<Void> clearLogs() {
        log.info("DELETE /api/ocr/logs");
        ocrService.clearLogs();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/logs/old")
    public ResponseEntity<Void> deleteOldLogs() {
        log.info("DELETE /api/ocr/logs/old");
        ocrService.deleteOldLogs();
        return ResponseEntity.ok().build();
    }

    // ============================================
    // STATISTICS
    // ============================================

    @GetMapping("/statistics")
    public ResponseEntity<OcrStatisticsResponse> getStatistics() {
        log.info("GET /api/ocr/statistics");
        return ResponseEntity.ok(ocrService.getStatistics());
    }

    // ============================================
    // EXTRACTION
    // ============================================

    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcrExtractionResultResponse> extractDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentTypeId") Long documentTypeId) {
        log.info("POST /api/ocr/extract - DocumentTypeId: {}, File: {}",
                documentTypeId, file.getOriginalFilename());
        return ResponseEntity.ok(ocrService.extractDocument(documentTypeId, file));
    }
}