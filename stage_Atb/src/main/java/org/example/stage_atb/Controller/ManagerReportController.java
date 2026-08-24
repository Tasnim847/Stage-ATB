// Controller/ManagerReportController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IManagerReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('MANAGER')")
public class ManagerReportController {

    private final IManagerReportService managerReportService;

    /**
     * Génère un rapport détaillé
     */
    @PostMapping("/detailed")
    public ResponseEntity<byte[]> generateDetailedReport(
            @RequestBody(required = false) Map<String, String> params) {

        log.info("📊 Génération du rapport détaillé - params: {}", params);

        String period = params != null ? params.getOrDefault("period", "month") : "month";
        String segment = params != null ? params.getOrDefault("segment", "all") : "all";

        byte[] reportData = managerReportService.generateDetailedReport(period, segment);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "rapport_detaille.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    /**
     * Génère un rapport stratégique (existant)
     */
    @PostMapping("/strategy")
    public ResponseEntity<byte[]> generateStrategyReport() {
        log.info("📊 Génération du rapport stratégique");

        byte[] reportData = managerReportService.generateStrategyReport();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "rapport_strategique.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    /**
     * Génère un rapport d'analyse de portefeuille
     */
    @PostMapping("/portfolio-analysis")
    public ResponseEntity<byte[]> generatePortfolioAnalysisReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String format) {

        log.info("📊 Génération du rapport d'analyse de portefeuille - year: {}, format: {}", year, format);

        byte[] reportData = managerReportService.generatePortfolioAnalysisReport(year, format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(format) ?
                MediaType.APPLICATION_OCTET_STREAM : MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                "analyse_portefeuille_" + (year != null ? year : LocalDateTime.now().getYear()) +
                        ("excel".equals(format) ? ".xlsx" : ".pdf"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    /**
     * Génère un rapport de performance des analystes
     */
    @PostMapping("/analyst-performance")
    public ResponseEntity<byte[]> generateAnalystPerformanceReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String analystId) {

        log.info("📊 Génération du rapport de performance des analystes - year: {}, analystId: {}", year, analystId);

        byte[] reportData = managerReportService.generateAnalystPerformanceReport(year, analystId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "performance_analystes.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }
}