package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IDocumentService;
import org.example.stage_atb.dto.request.DocumentUploadRequestDTO;
import org.example.stage_atb.dto.request.DocumentVerificationRequestDTO;
import org.example.stage_atb.dto.response.DocumentResponseDTO;
import org.example.stage_atb.dto.response.ApiResponse;
import org.example.stage_atb.enums.DocumentType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final IDocumentService documentService;

    // ✅ SOLUTION RECOMMANDÉE : Utiliser @RequestParam
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("clientId") String clientId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "creditRequestId", required = false) String creditRequestId) {

        log.info("=== UPLOAD DOCUMENT ===");
        log.info("📤 File: {}", file.getOriginalFilename());
        log.info("📤 File Size: {} bytes", file.getSize());
        log.info("📤 ClientId: {}", clientId);
        log.info("📤 DocumentType: {}", documentType);
        log.info("📤 Description: {}", description);
        log.info("📤 CreditRequestId: {}", creditRequestId);

        try {
            // Convertir le type de document
            DocumentType docType;
            try {
                docType = DocumentType.valueOf(documentType);
            } catch (IllegalArgumentException e) {
                log.error("Invalid document type: {}", documentType);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid document type: " + documentType));
            }

            // Vérifier que le fichier n'est pas vide
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty"));
            }

            // Créer le DTO
            DocumentUploadRequestDTO requestDTO = DocumentUploadRequestDTO.builder()
                    .file(file)
                    .clientId(clientId)
                    .documentType(docType)
                    .description(description)
                    .creditRequestId(creditRequestId)
                    .build();

            DocumentResponseDTO response = documentService.uploadDocument(requestDTO);
            log.info("✅ Document uploaded successfully with id: {}", response.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Document uploaded successfully", response));

        } catch (Exception e) {
            log.error("❌ Error uploading document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error uploading document: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> getDocumentById(@PathVariable String id) {
        log.info("GET /api/documents/{} - Fetching document", id);
        DocumentResponseDTO response = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", response));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByClient(
            @PathVariable String clientId) {
        log.info("GET /api/documents/client/{} - Fetching client documents", clientId);
        List<DocumentResponseDTO> response = documentService.getDocumentsByClient(clientId);
        return ResponseEntity.ok(ApiResponse.success("Client documents retrieved successfully", response));
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByCreditRequest(
            @PathVariable String creditRequestId) {
        log.info("GET /api/documents/credit-request/{} - Fetching credit request documents", creditRequestId);
        List<DocumentResponseDTO> response = documentService.getDocumentsByCreditRequest(creditRequestId);
        return ResponseEntity.ok(ApiResponse.success("Credit request documents retrieved successfully", response));
    }

    @GetMapping("/type/{documentType}")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByType(
            @PathVariable DocumentType documentType) {
        log.info("GET /api/documents/type/{} - Fetching documents by type", documentType);
        List<DocumentResponseDTO> response = documentService.getDocumentsByType(documentType);
        return ResponseEntity.ok(ApiResponse.success("Documents by type retrieved successfully", response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getAllDocuments() {
        log.info("GET /api/documents/all - Fetching all documents");
        List<DocumentResponseDTO> response = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("All documents retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> updateDocument(
            @PathVariable String id,
            @Valid @RequestBody DocumentUploadRequestDTO requestDTO) {
        log.info("PUT /api/documents/{} - Updating document", id);
        DocumentResponseDTO response = documentService.updateDocument(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable String id) {
        log.info("DELETE /api/documents/{} - Deleting document", id);
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> verifyDocument(
            @PathVariable String id,
            @Valid @RequestBody DocumentVerificationRequestDTO verificationRequest) {
        log.info("PATCH /api/documents/{}/verify - Verifying document", id);
        DocumentResponseDTO response = documentService.verifyDocument(
                id,
                verificationRequest.getVerified(),
                verificationRequest.getVerificationNotes()
        );
        return ResponseEntity.ok(ApiResponse.success("Document verification status updated", response));
    }

    @PostMapping("/{id}/ocr")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> processDocumentWithOCR(@PathVariable String id) {
        log.info("POST /api/documents/{}/ocr - Processing document with OCR", id);
        DocumentResponseDTO response = documentService.processDocumentWithOCR(id);
        return ResponseEntity.ok(ApiResponse.success("OCR processing completed", response));
    }

    @PostMapping("/{id}/extract")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> extractDataFromDocument(@PathVariable String id) {
        log.info("POST /api/documents/{}/extract - Extracting data from document", id);
        DocumentResponseDTO response = documentService.extractDataFromDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Data extraction completed", response));
    }

    @GetMapping("/unverified")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getUnverifiedDocuments() {
        log.info("GET /api/documents/unverified - Fetching unverified documents");
        List<DocumentResponseDTO> response = documentService.getUnverifiedDocuments();
        return ResponseEntity.ok(ApiResponse.success("Unverified documents retrieved successfully", response));
    }

    @GetMapping("/incomplete")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getIncompleteDocuments() {
        log.info("GET /api/documents/incomplete - Fetching incomplete documents");
        List<DocumentResponseDTO> response = documentService.getIncompleteDocuments();
        return ResponseEntity.ok(ApiResponse.success("Incomplete documents retrieved successfully", response));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String id) {
        log.info("GET /api/documents/{}/download - Downloading document", id);
        byte[] fileContent = documentService.downloadDocument(id);

        DocumentResponseDTO document = documentService.getDocumentById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", document.getFileName());
        headers.setContentLength(fileContent.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
    }

    // Endpoints pour la gestion des types de documents
    @GetMapping("/mandatory-types")
    public ResponseEntity<ApiResponse<List<DocumentType>>> getMandatoryDocumentTypes() {
        log.info("GET /api/documents/mandatory-types - Fetching mandatory document types");
        List<DocumentType> mandatoryTypes = documentService.getMandatoryDocumentTypes();
        return ResponseEntity.ok(ApiResponse.success("Mandatory document types retrieved successfully", mandatoryTypes));
    }

    @GetMapping("/client/{clientId}/mandatory-status")
    public ResponseEntity<ApiResponse<Map<DocumentType, Boolean>>> getMandatoryDocumentStatus(
            @PathVariable String clientId) {
        log.info("GET /api/documents/client/{}/mandatory-status - Fetching mandatory document status", clientId);
        Map<DocumentType, Boolean> status = documentService.getMandatoryDocumentStatusForClient(clientId);
        return ResponseEntity.ok(ApiResponse.success("Mandatory document status retrieved successfully", status));
    }

    @GetMapping("/client/{clientId}/missing-mandatory")
    public ResponseEntity<ApiResponse<List<DocumentType>>> getMissingMandatoryDocuments(
            @PathVariable String clientId) {
        log.info("GET /api/documents/client/{}/missing-mandatory - Fetching missing mandatory documents", clientId);
        List<DocumentType> missing = documentService.getMissingMandatoryDocuments(clientId);
        return ResponseEntity.ok(ApiResponse.success("Missing mandatory documents retrieved successfully", missing));
    }
}