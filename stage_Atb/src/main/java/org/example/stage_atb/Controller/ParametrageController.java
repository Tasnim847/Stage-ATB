// Controller/ParametrageController.java
package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.ParametrageService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parametrage")
@RequiredArgsConstructor
@Slf4j
public class ParametrageController {

    private final ParametrageService parametrageService;

    // ============================================
    // TYPES DE CRÉDIT
    // ============================================

    @GetMapping("/credit-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CreditTypeResponseDTO>> getAllCreditTypes() {
        log.info("GET /api/parametrage/credit-types");
        return ResponseEntity.ok(parametrageService.getAllCreditTypes());
    }

    @GetMapping("/credit-types/active")
    public ResponseEntity<List<CreditTypeResponseDTO>> getActiveCreditTypes() {
        log.info("GET /api/parametrage/credit-types/active");
        return ResponseEntity.ok(parametrageService.getActiveCreditTypes());
    }

    @GetMapping("/credit-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditTypeResponseDTO> getCreditTypeById(@PathVariable String id) {
        log.info("GET /api/parametrage/credit-types/{}", id);
        return ResponseEntity.ok(parametrageService.getCreditTypeById(id));
    }

    @PostMapping("/credit-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditTypeResponseDTO> createCreditType(
            @Valid @RequestBody CreditTypeRequestDTO request) {
        log.info("POST /api/parametrage/credit-types");
        return new ResponseEntity<>(parametrageService.createCreditType(request), HttpStatus.CREATED);
    }

    @PatchMapping("/credit-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditTypeResponseDTO> updateCreditType(
            @PathVariable String id,
            @Valid @RequestBody CreditTypeRequestDTO request) {
        log.info("PATCH /api/parametrage/credit-types/{}", id);
        return ResponseEntity.ok(parametrageService.updateCreditType(id, request));
    }

    @DeleteMapping("/credit-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCreditType(@PathVariable String id) {
        log.info("DELETE /api/parametrage/credit-types/{}", id);
        parametrageService.deleteCreditType(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/credit-types/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditTypeResponseDTO> toggleCreditTypeStatus(@PathVariable String id) {
        log.info("PATCH /api/parametrage/credit-types/{}/toggle", id);
        return ResponseEntity.ok(parametrageService.toggleCreditTypeStatus(id));
    }

    // ============================================
    // TAUX D'INTÉRÊT
    // ============================================

    @GetMapping("/interest-rates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterestRateResponseDTO>> getAllInterestRates() {
        log.info("GET /api/parametrage/interest-rates");
        return ResponseEntity.ok(parametrageService.getAllInterestRates());
    }

    @GetMapping("/interest-rates/credit-type/{creditTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterestRateResponseDTO>> getInterestRatesByCreditType(
            @PathVariable String creditTypeId) {
        log.info("GET /api/parametrage/interest-rates/credit-type/{}", creditTypeId);
        return ResponseEntity.ok(parametrageService.getInterestRatesByCreditType(creditTypeId));
    }

    @GetMapping("/interest-rates/default/{creditTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterestRateResponseDTO> getDefaultInterestRate(
            @PathVariable String creditTypeId) {
        log.info("GET /api/parametrage/interest-rates/default/{}", creditTypeId);
        return ResponseEntity.ok(parametrageService.getDefaultInterestRate(creditTypeId));
    }

    @GetMapping("/interest-rates/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterestRateResponseDTO> getInterestRateById(@PathVariable String id) {
        log.info("GET /api/parametrage/interest-rates/{}", id);
        return ResponseEntity.ok(parametrageService.getInterestRateById(id));
    }

    @PostMapping("/interest-rates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterestRateResponseDTO> createInterestRate(
            @Valid @RequestBody InterestRateRequestDTO request) {
        log.info("POST /api/parametrage/interest-rates");
        return new ResponseEntity<>(parametrageService.createInterestRate(request), HttpStatus.CREATED);
    }

    @PatchMapping("/interest-rates/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterestRateResponseDTO> updateInterestRate(
            @PathVariable String id,
            @Valid @RequestBody InterestRateRequestDTO request) {
        log.info("PATCH /api/parametrage/interest-rates/{}", id);
        return ResponseEntity.ok(parametrageService.updateInterestRate(id, request));
    }

    @DeleteMapping("/interest-rates/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInterestRate(@PathVariable String id) {
        log.info("DELETE /api/parametrage/interest-rates/{}", id);
        parametrageService.deleteInterestRate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/interest-rates/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterestRateResponseDTO> toggleInterestRateStatus(@PathVariable String id) {
        log.info("PATCH /api/parametrage/interest-rates/{}/toggle", id);
        return ResponseEntity.ok(parametrageService.toggleInterestRateStatus(id));
    }

    // ============================================
    // DURÉES
    // ============================================

    @GetMapping("/durations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DurationConfigResponseDTO>> getAllDurations() {
        log.info("GET /api/parametrage/durations");
        return ResponseEntity.ok(parametrageService.getAllDurations());
    }

    @GetMapping("/durations/credit-type/{creditTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DurationConfigResponseDTO>> getDurationsByCreditType(
            @PathVariable String creditTypeId) {
        log.info("GET /api/parametrage/durations/credit-type/{}", creditTypeId);
        return ResponseEntity.ok(parametrageService.getDurationsByCreditType(creditTypeId));
    }

    @GetMapping("/durations/default/{creditTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DurationConfigResponseDTO> getDefaultDuration(
            @PathVariable String creditTypeId) {
        log.info("GET /api/parametrage/durations/default/{}", creditTypeId);
        return ResponseEntity.ok(parametrageService.getDefaultDuration(creditTypeId));
    }

    @GetMapping("/durations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DurationConfigResponseDTO> getDurationById(@PathVariable String id) {
        log.info("GET /api/parametrage/durations/{}", id);
        return ResponseEntity.ok(parametrageService.getDurationById(id));
    }

    @PostMapping("/durations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DurationConfigResponseDTO> createDuration(
            @Valid @RequestBody DurationConfigRequestDTO request) {
        log.info("POST /api/parametrage/durations");
        return new ResponseEntity<>(parametrageService.createDuration(request), HttpStatus.CREATED);
    }

    @PatchMapping("/durations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DurationConfigResponseDTO> updateDuration(
            @PathVariable String id,
            @Valid @RequestBody DurationConfigRequestDTO request) {
        log.info("PATCH /api/parametrage/durations/{}", id);
        return ResponseEntity.ok(parametrageService.updateDuration(id, request));
    }

    @DeleteMapping("/durations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDuration(@PathVariable String id) {
        log.info("DELETE /api/parametrage/durations/{}", id);
        parametrageService.deleteDuration(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/durations/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DurationConfigResponseDTO> toggleDurationStatus(@PathVariable String id) {
        log.info("PATCH /api/parametrage/durations/{}/toggle", id);
        return ResponseEntity.ok(parametrageService.toggleDurationStatus(id));
    }

    // ============================================
    // PLAFONDS
    // ============================================

    @GetMapping("/ceilings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CeilingConfigResponseDTO>> getAllCeilings() {
        log.info("GET /api/parametrage/ceilings");
        return ResponseEntity.ok(parametrageService.getAllCeilings());
    }

    @GetMapping("/ceilings/credit-type/{creditTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CeilingConfigResponseDTO>> getCeilingsByCreditType(
            @PathVariable String creditTypeId) {
        log.info("GET /api/parametrage/ceilings/credit-type/{}", creditTypeId);
        return ResponseEntity.ok(parametrageService.getCeilingsByCreditType(creditTypeId));
    }

    @GetMapping("/ceilings/amount/{creditTypeId}/{amount}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CeilingConfigResponseDTO> getCeilingByAmount(
            @PathVariable String creditTypeId,
            @PathVariable Double amount) {
        log.info("GET /api/parametrage/ceilings/amount/{}/{}", creditTypeId, amount);
        return ResponseEntity.ok(parametrageService.getCeilingByAmount(creditTypeId, amount));
    }

    @GetMapping("/ceilings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CeilingConfigResponseDTO> getCeilingById(@PathVariable String id) {
        log.info("GET /api/parametrage/ceilings/{}", id);
        return ResponseEntity.ok(parametrageService.getCeilingById(id));
    }

    @PostMapping("/ceilings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CeilingConfigResponseDTO> createCeiling(
            @Valid @RequestBody CeilingConfigRequestDTO request) {
        log.info("POST /api/parametrage/ceilings");
        return new ResponseEntity<>(parametrageService.createCeiling(request), HttpStatus.CREATED);
    }

    @PatchMapping("/ceilings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CeilingConfigResponseDTO> updateCeiling(
            @PathVariable String id,
            @Valid @RequestBody CeilingConfigRequestDTO request) {
        log.info("PATCH /api/parametrage/ceilings/{}", id);
        return ResponseEntity.ok(parametrageService.updateCeiling(id, request));
    }

    @DeleteMapping("/ceilings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCeiling(@PathVariable String id) {
        log.info("DELETE /api/parametrage/ceilings/{}", id);
        parametrageService.deleteCeiling(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/ceilings/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CeilingConfigResponseDTO> toggleCeilingStatus(@PathVariable String id) {
        log.info("PATCH /api/parametrage/ceilings/{}/toggle", id);
        return ResponseEntity.ok(parametrageService.toggleCeilingStatus(id));
    }

    // ============================================
    // VALIDATION
    // ============================================

    @GetMapping("/validate/amount/{creditTypeId}/{amount}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> validateAmount(
            @PathVariable String creditTypeId,
            @PathVariable Double amount) {
        log.info("GET /api/parametrage/validate/amount/{}/{}", creditTypeId, amount);
        return ResponseEntity.ok(parametrageService.validateAmount(creditTypeId, amount));
    }
}