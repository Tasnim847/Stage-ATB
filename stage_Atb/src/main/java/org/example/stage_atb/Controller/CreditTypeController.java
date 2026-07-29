package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.ICreditTypeService;
import org.example.stage_atb.dto.response.CreditTypeResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit-types")
@RequiredArgsConstructor
@Slf4j
public class CreditTypeController {

    private final ICreditTypeService creditTypeService;

    /**
     * Récupérer tous les types de crédit actifs
     */
    @GetMapping("/active")
    public ResponseEntity<List<CreditTypeResponseDTO>> getActiveCreditTypes() {
        log.info("GET /api/credit-types/active");
        return ResponseEntity.ok(creditTypeService.getActiveCreditTypes());
    }

    /**
     * Récupérer un type de crédit par son ID
     * ✅ ENDPOINT MANQUANT - AJOUTER CETTE MÉTHODE
     */
    @GetMapping("/{id}")
    public ResponseEntity<CreditTypeResponseDTO> getCreditTypeById(@PathVariable String id) {
        log.info("GET /api/credit-types/{}", id);
        return ResponseEntity.ok(creditTypeService.getCreditTypeById(id));
    }

    /**
     * Récupérer un type de crédit avec ses paramètres
     */
    @GetMapping("/{id}/params")
    public ResponseEntity<CreditTypeResponseDTO> getCreditTypeWithParams(@PathVariable String id) {
        log.info("GET /api/credit-types/{}/params", id);
        return ResponseEntity.ok(creditTypeService.getCreditTypeWithParams(id));
    }

    /**
     * Valider un montant pour un type de crédit
     */
    @GetMapping("/{id}/validate/amount/{amount}")
    public ResponseEntity<Map<String, Object>> validateAmount(
            @PathVariable String id,
            @PathVariable Double amount) {
        log.info("GET /api/credit-types/{}/validate/amount/{}", id, amount);

        boolean isValid = creditTypeService.validateAmount(id, amount);
        CreditTypeResponseDTO creditType = creditTypeService.getCreditTypeById(id);

        return ResponseEntity.ok(Map.of(
                "valid", isValid,
                "minAmount", creditType.getMinAmount(),
                "maxAmount", creditType.getMaxAmount()
        ));
    }

    /**
     * Valider une durée pour un type de crédit
     */
    @GetMapping("/{id}/validate/duration/{duration}")
    public ResponseEntity<Map<String, Object>> validateDuration(
            @PathVariable String id,
            @PathVariable Integer duration) {
        log.info("GET /api/credit-types/{}/validate/duration/{}", id, duration);

        boolean isValid = creditTypeService.validateDuration(id, duration);
        CreditTypeResponseDTO creditType = creditTypeService.getCreditTypeById(id);

        return ResponseEntity.ok(Map.of(
                "valid", isValid,
                "minDuration", creditType.getMinDurationMonths(),
                "maxDuration", creditType.getMaxDurationMonths()
        ));
    }

    /**
     * Récupérer les durées disponibles pour un type de crédit
     */
    @GetMapping("/{id}/durations")
    public ResponseEntity<List<Integer>> getAvailableDurations(@PathVariable String id) {
        log.info("GET /api/credit-types/{}/durations", id);
        return ResponseEntity.ok(creditTypeService.getAvailableDurations(id));
    }

    /**
     * Récupérer les documents requis pour un type de crédit
     */
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<String>> getRequiredDocuments(@PathVariable String id) {
        log.info("GET /api/credit-types/{}/documents", id);
        return ResponseEntity.ok(creditTypeService.getRequiredDocuments(id));
    }
}