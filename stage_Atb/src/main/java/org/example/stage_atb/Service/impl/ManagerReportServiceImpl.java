// Service/impl/ManagerReportServiceImpl.java - Version corrigée
package org.example.stage_atb.Service.impl;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IManagerReportService;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerReportServiceImpl implements IManagerReportService {

    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)  // ✅ AJOUTER @Transactional
    public byte[] generateDetailedReport(String period, String segment) {
        log.info("📊 Génération du rapport détaillé - period: {}, segment: {}", period, segment);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Créer un document PDF
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Titre
            document.add(new Paragraph("RAPPORT DÉTAILLÉ DU PORTEFEUILLE")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18));

            document.add(new Paragraph(" "));

            // Période
            document.add(new Paragraph("Période: " + period));
            document.add(new Paragraph("Segment: " + segment));
            document.add(new Paragraph("Date: " + LocalDateTime.now()));

            document.add(new Paragraph(" "));

            // Récupérer les données
            int year = Year.now().getValue();
            LocalDateTime startDate = LocalDate.of(year, 1, 1).atStartOfDay();
            LocalDateTime endDate = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

            List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

            // Filtrer par segment
            if (segment != null && !segment.isEmpty() && !"all".equals(segment)) {
                credits = credits.stream()
                        .filter(cr -> cr.getCreditType() != null &&
                                cr.getCreditType().getName().toLowerCase().contains(segment.toLowerCase()))
                        .collect(Collectors.toList());
            }

            // ✅ FORCER L'INITIALISATION DES DONNÉES LAZY
            // Cela permet de charger les données avant la fermeture de la session
            credits = credits.stream()
                    .map(cr -> {
                        // Accéder aux propriétés pour les initialiser
                        if (cr.getClient() != null) {
                            cr.getClient().getFirstName();
                            cr.getClient().getLastName();
                            cr.getClient().getEmail();
                        }
                        if (cr.getCreditType() != null) {
                            cr.getCreditType().getName();
                        }
                        return cr;
                    })
                    .collect(Collectors.toList());

            // Statistiques
            int total = credits.size();
            long approved = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.APPROVED).count();
            long rejected = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.REJECTED).count();
            long pending = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.PENDING_ANALYSIS).count();

            BigDecimal totalAmount = credits.stream()
                    .map(CreditRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            document.add(new Paragraph("📊 STATISTIQUES GLOBALES")
                    .setFontSize(14));
            document.add(new Paragraph("Total des crédits: " + total));
            document.add(new Paragraph("Approuvés: " + approved));
            document.add(new Paragraph("Rejetés: " + rejected));
            document.add(new Paragraph("En attente: " + pending));
            document.add(new Paragraph("Montant total: " + totalAmount + " TND"));

            document.add(new Paragraph(" "));

            // Liste des crédits
            if (!credits.isEmpty()) {
                document.add(new Paragraph("📋 LISTE DES CRÉDITS (résumé)")
                        .setFontSize(14));

                // Créer un tableau
                float[] columnWidths = {4, 3, 3, 3};
                Table table = new Table(UnitValue.createPercentArray(columnWidths));
                table.setWidth(UnitValue.createPercentValue(100));

                // En-têtes
                table.addCell("Client");
                table.addCell("Montant");
                table.addCell("Type");
                table.addCell("Statut");

                // Données (limité à 20)
                int limit = Math.min(credits.size(), 20);
                for (int i = 0; i < limit; i++) {
                    CreditRequest cr = credits.get(i);
                    String clientName = cr.getClient() != null ?
                            cr.getClient().getFirstName() + " " + cr.getClient().getLastName() : "Client inconnu";
                    String creditType = cr.getCreditType() != null ?
                            cr.getCreditType().getName() : "N/A";

                    table.addCell(clientName);
                    table.addCell(cr.getAmount().toString());
                    table.addCell(creditType);
                    table.addCell(cr.getStatus().name());
                }

                document.add(table);

                if (credits.size() > 20) {
                    document.add(new Paragraph("... et " + (credits.size() - 20) + " autres crédits"));
                }
            }

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du rapport: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du rapport", e);
        }
    }

    @Override
    @Transactional(readOnly = true)  // ✅ AJOUTER @Transactional
    public byte[] generateStrategyReport() {
        log.info("📊 Génération du rapport stratégique");

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Titre
            document.add(new Paragraph("RAPPORT STRATÉGIQUE")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18));

            document.add(new Paragraph("Date: " + LocalDateTime.now())
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(" "));

            // Récupérer les données
            int year = Year.now().getValue();
            LocalDateTime startDate = LocalDate.of(year, 1, 1).atStartOfDay();
            LocalDateTime endDate = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

            List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

            // ✅ FORCER L'INITIALISATION
            credits = credits.stream()
                    .map(cr -> {
                        if (cr.getClient() != null) {
                            cr.getClient().getFirstName();
                        }
                        if (cr.getCreditType() != null) {
                            cr.getCreditType().getName();
                        }
                        return cr;
                    })
                    .collect(Collectors.toList());

            // Statistiques
            int total = credits.size();
            long approved = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.APPROVED).count();
            long rejected = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.REJECTED).count();

            BigDecimal totalApproved = credits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                    .map(CreditRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Ratio
            double approvalRate = total > 0 ? (approved * 100.0 / total) : 0;
            double rejectionRate = total > 0 ? (rejected * 100.0 / total) : 0;

            document.add(new Paragraph("📈 PERFORMANCE GLOBALE")
                    .setFontSize(14));
            document.add(new Paragraph("Total crédits traités: " + total));
            document.add(new Paragraph("Taux d'approbation: " + String.format("%.1f%%", approvalRate)));
            document.add(new Paragraph("Taux de rejet: " + String.format("%.1f%%", rejectionRate)));
            document.add(new Paragraph("Montant total approuvé: " + totalApproved + " TND"));

            document.add(new Paragraph(" "));

            // Analyse par type de crédit
            document.add(new Paragraph("🏦 ANALYSE PAR TYPE DE CRÉDIT")
                    .setFontSize(14));

            Map<String, List<CreditRequest>> byType = credits.stream()
                    .filter(cr -> cr.getCreditType() != null)
                    .collect(Collectors.groupingBy(cr -> cr.getCreditType().getName()));

            for (Map.Entry<String, List<CreditRequest>> entry : byType.entrySet()) {
                List<CreditRequest> typeCredits = entry.getValue();
                long typeApproved = typeCredits.stream()
                        .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                        .count();
                double typeRate = typeCredits.size() > 0 ? (typeApproved * 100.0 / typeCredits.size()) : 0;

                document.add(new Paragraph("• " + entry.getKey() + ": " + typeCredits.size() + " crédits, " +
                        String.format("%.1f%%", typeRate) + " d'approbation"));
            }

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du rapport stratégique: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du rapport stratégique", e);
        }
    }

    @Override
    @Transactional(readOnly = true)  // ✅ AJOUTER @Transactional
    public byte[] generatePortfolioAnalysisReport(Integer year, String format) {
        log.info("📊 Génération du rapport d'analyse de portefeuille - year: {}, format: {}", year, format);

        int targetYear = (year != null) ? year : Year.now().getValue();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("ANALYSE DU PORTEFEUILLE " + targetYear)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18));

            document.add(new Paragraph("Date: " + LocalDateTime.now())
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(" "));

            // Récupérer les données
            LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
            LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

            List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

            // ✅ FORCER L'INITIALISATION
            credits = credits.stream()
                    .map(cr -> {
                        if (cr.getClient() != null) {
                            cr.getClient().getFirstName();
                        }
                        if (cr.getCreditType() != null) {
                            cr.getCreditType().getName();
                        }
                        return cr;
                    })
                    .collect(Collectors.toList());

            // Analyse
            int total = credits.size();
            long active = credits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED ||
                            cr.getStatus() == CreditStatus.UNDER_REVIEW ||
                            cr.getStatus() == CreditStatus.PENDING_ANALYSIS)
                    .count();

            BigDecimal totalAmount = credits.stream()
                    .map(CreditRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            document.add(new Paragraph("📊 APERÇU DU PORTEFEUILLE"));
            document.add(new Paragraph("Année: " + targetYear));
            document.add(new Paragraph("Total des crédits: " + total));
            document.add(new Paragraph("Crédits actifs: " + active));
            document.add(new Paragraph("Montant total: " + totalAmount + " TND"));

            document.add(new Paragraph(" "));

            // Répartition par statut
            document.add(new Paragraph("📈 RÉPARTITION PAR STATUT"));
            Map<CreditStatus, Long> byStatus = credits.stream()
                    .collect(Collectors.groupingBy(CreditRequest::getStatus, Collectors.counting()));

            for (Map.Entry<CreditStatus, Long> entry : byStatus.entrySet()) {
                document.add(new Paragraph("• " + entry.getKey().name() + ": " + entry.getValue()));
            }

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du rapport d'analyse: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du rapport d'analyse", e);
        }
    }

    @Override
    @Transactional(readOnly = true)  // ✅ AJOUTER @Transactional
    public byte[] generateAnalystPerformanceReport(Integer year, String analystId) {
        log.info("📊 Génération du rapport de performance des analystes - year: {}, analystId: {}", year, analystId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("RAPPORT DE PERFORMANCE DES ANALYSTES")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18));

            document.add(new Paragraph("Date: " + LocalDateTime.now())
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(" "));

            // Récupérer les analystes
            List<User> analysts = userRepository.findByRole(UserRole.ANALYST);

            if (analystId != null && !analystId.isEmpty()) {
                analysts = analysts.stream()
                        .filter(u -> u.getId().equals(analystId))
                        .collect(Collectors.toList());
            }

            int targetYear = (year != null) ? year : Year.now().getValue();
            LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
            LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

            List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

            // ✅ FORCER L'INITIALISATION
            credits = credits.stream()
                    .map(cr -> {
                        if (cr.getClient() != null) {
                            cr.getClient().getFirstName();
                            if (cr.getClient().getAnalyst() != null) {
                                cr.getClient().getAnalyst().getFirstName();
                            }
                        }
                        return cr;
                    })
                    .collect(Collectors.toList());

            document.add(new Paragraph("📊 PERFORMANCE DES ANALYSTES"));

            for (User analyst : analysts) {
                List<CreditRequest> analystCredits = credits.stream()
                        .filter(cr -> cr.getClient() != null &&
                                cr.getClient().getAnalyst() != null &&
                                cr.getClient().getAnalyst().getId().equals(analyst.getId()))
                        .collect(Collectors.toList());

                int processed = analystCredits.size();
                long approved = analystCredits.stream()
                        .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                        .count();
                long rejected = analystCredits.stream()
                        .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                        .count();

                double efficiency = processed > 0 ? (approved * 100.0 / processed) : 0;

                document.add(new Paragraph(" "));
                document.add(new Paragraph("👤 " + analyst.getFirstName() + " " + analyst.getLastName())
                        .setFontSize(12));
                document.add(new Paragraph("   Crédits traités: " + processed));
                document.add(new Paragraph("   Approuvés: " + approved));
                document.add(new Paragraph("   Rejetés: " + rejected));
                document.add(new Paragraph("   Efficacité: " + String.format("%.1f%%", efficiency)));
            }

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du rapport de performance: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du rapport de performance", e);
        }
    }
}