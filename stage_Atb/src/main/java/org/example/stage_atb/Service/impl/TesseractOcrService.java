// Service/impl/TesseractOcrService.java
package org.example.stage_atb.Service.impl;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.example.stage_atb.Service.IOcrEngineService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class TesseractOcrService implements IOcrEngineService {

    @Override
    public Map<String, Object> extractDocument(MultipartFile file, String documentType) {
        log.info("📄 Extraction OCR avec Tesseract pour le type: {}", documentType);

        try {
            // 1. Configurer Tesseract
            ITesseract tesseract = new Tesseract();

            // ⚠️ Adapter le chemin selon votre installation
            // Windows: "C:/Program Files/Tesseract-OCR/tessdata"
            // Linux: "/usr/share/tesseract-ocr/4.00/tessdata"
            // Mac: "/usr/local/share/tessdata"
            String tessdataPath = System.getProperty("os.name").toLowerCase().contains("win")
                    ? "C:/Program Files/Tesseract-OCR/tessdata"
                    : "/usr/share/tesseract-ocr/4.00/tessdata";

            tesseract.setDatapath(tessdataPath);
            tesseract.setLanguage("fra+ara+eng");
            tesseract.setPageSegMode(1); // Auto segmentation
            tesseract.setOcrEngineMode(1); // LSTM engine

            // 2. Lire l'image
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new RuntimeException("Le fichier n'est pas une image valide");
            }

            // 3. Extraire le texte
            String extractedText = tesseract.doOCR(image);
            log.info("📝 Texte extrait ({} caractères): {}", extractedText.length(),
                    extractedText.length() > 100 ? extractedText.substring(0, 100) + "..." : extractedText);

            // 4. Parser le texte extrait en fonction du type de document
            Map<String, Object> extractedFields = parseExtractedText(extractedText, documentType);

            // 5. Ajouter les métadonnées
            extractedFields.put("nomFichier", file.getOriginalFilename());
            extractedFields.put("tailleFichier", file.getSize());
            extractedFields.put("rawText", extractedText);
            extractedFields.put("confidence", 85); // Valeur par défaut

            log.info("✅ Extraction Tesseract réussie - {} champs extraits", extractedFields.size() - 3);
            return extractedFields;

        } catch (TesseractException e) {
            log.error("❌ Erreur Tesseract", e);
            throw new RuntimeException("Erreur d'extraction Tesseract: " + e.getMessage(), e);
        } catch (IOException e) {
            log.error("❌ Erreur de lecture du fichier", e);
            throw new RuntimeException("Erreur de lecture du fichier: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Erreur inattendue", e);
            throw new RuntimeException("Erreur lors de l'extraction: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> parseExtractedText(String text, String documentType) {
        Map<String, Object> fields = new HashMap<>();

        // Nettoyer le texte
        String cleanText = text.replaceAll("[^\\p{L}\\p{N}\\s:.,-]", " ").trim();

        // === CIN / IDENTITY ===
        if (documentType.equals("CIN") || documentType.equals("IDENTITY")) {
            // Recherche du nom (pattern: Nom: Dupont ou NOM: DUPONT)
            Pattern namePattern = Pattern.compile("(?:Nom|NOM|Name)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)");
            Matcher nameMatcher = namePattern.matcher(cleanText);
            if (nameMatcher.find()) {
                fields.put("nom", nameMatcher.group(1).trim());
            }

            // Recherche du prénom
            Pattern firstNamePattern = Pattern.compile("(?:Prénom|Prenom|Prenom|First Name)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)");
            Matcher firstNameMatcher = firstNamePattern.matcher(cleanText);
            if (firstNameMatcher.find()) {
                fields.put("prenom", firstNameMatcher.group(1).trim());
            }

            // Recherche du CIN (8 chiffres)
            Pattern cinPattern = Pattern.compile("\\b(\\d{8})\\b");
            Matcher cinMatcher = cinPattern.matcher(cleanText);
            if (cinMatcher.find()) {
                fields.put("cin", cinMatcher.group(1));
            }

            // Recherche de la date de naissance (format: JJ/MM/AAAA ou JJ-MM-AAAA)
            Pattern datePattern = Pattern.compile("\\b(\\d{2})[/-](\\d{2})[/-](\\d{4})\\b");
            Matcher dateMatcher = datePattern.matcher(cleanText);
            if (dateMatcher.find()) {
                fields.put("dateNaissance", dateMatcher.group(1) + "-" + dateMatcher.group(2) + "-" + dateMatcher.group(3));
            }

            // Recherche de la date d'expiration
            Pattern expPattern = Pattern.compile("(?:Exp|EXP|Expiration|expiration)\\s*[:]?\\s*(\\d{2})[/-](\\d{2})[/-](\\d{4})");
            Matcher expMatcher = expPattern.matcher(cleanText);
            if (expMatcher.find()) {
                fields.put("dateExpiration", expMatcher.group(1) + "-" + expMatcher.group(2) + "-" + expMatcher.group(3));
            }
        }

        // === BANK_STATEMENT ===
        if (documentType.equals("BANK_STATEMENT")) {
            // Recherche de la banque
            Pattern bankPattern = Pattern.compile("(?:Banque|Bank|BANQUE)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)");
            Matcher bankMatcher = bankPattern.matcher(cleanText);
            if (bankMatcher.find()) {
                fields.put("banque", bankMatcher.group(1).trim());
            }

            // Recherche du titulaire
            Pattern holderPattern = Pattern.compile("(?:Titulaire|Holder|Titulaire du compte)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)");
            Matcher holderMatcher = holderPattern.matcher(cleanText);
            if (holderMatcher.find()) {
                fields.put("titulaire", holderMatcher.group(1).trim());
            }

            // Recherche de l'IBAN (TN suivi de 20 chiffres)
            Pattern ibanPattern = Pattern.compile("TN\\d{20}");
            Matcher ibanMatcher = ibanPattern.matcher(cleanText);
            if (ibanMatcher.find()) {
                fields.put("iban", ibanMatcher.group());
            }

            // Recherche du solde (nombre avec décimales)
            Pattern amountPattern = Pattern.compile("(?:Solde|Balance|solde)\\s*[:]?\\s*(\\d+[,.]?\\d*)");
            Matcher amountMatcher = amountPattern.matcher(cleanText);
            if (amountMatcher.find()) {
                String solde = amountMatcher.group(1).replace(",", ".");
                try {
                    fields.put("solde", Double.parseDouble(solde));
                } catch (NumberFormatException e) {
                    fields.put("solde", solde);
                }
            }

            // Recherche des revenus mensuels
            Pattern revenuePattern = Pattern.compile("(?:Revenus|Revenue|revenus)\\s*[:]?\\s*(\\d+[,.]?\\d*)");
            Matcher revenueMatcher = revenuePattern.matcher(cleanText);
            if (revenueMatcher.find()) {
                String revenu = revenueMatcher.group(1).replace(",", ".");
                try {
                    fields.put("revenusMensuels", Double.parseDouble(revenu));
                } catch (NumberFormatException e) {
                    fields.put("revenusMensuels", revenu);
                }
            }
        }

        // === PAYSLIP ===
        if (documentType.equals("PAYSLIP")) {
            // Recherche de l'employeur
            Pattern employerPattern = Pattern.compile("(?:Employeur|Employer|Empl)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)");
            Matcher employerMatcher = employerPattern.matcher(cleanText);
            if (employerMatcher.find()) {
                fields.put("employeur", employerMatcher.group(1).trim());
            }

            // Recherche du salaire brut
            Pattern grossPattern = Pattern.compile("(?:Salaire brut|Brut|salaire brut)\\s*[:]?\\s*(\\d+[,.]?\\d*)");
            Matcher grossMatcher = grossPattern.matcher(cleanText);
            if (grossMatcher.find()) {
                String brut = grossMatcher.group(1).replace(",", ".");
                try {
                    fields.put("salaireBrut", Double.parseDouble(brut));
                } catch (NumberFormatException e) {
                    fields.put("salaireBrut", brut);
                }
            }

            // Recherche du salaire net
            Pattern netPattern = Pattern.compile("(?:Salaire net|Net|salaire net)\\s*[:]?\\s*(\\d+[,.]?\\d*)");
            Matcher netMatcher = netPattern.matcher(cleanText);
            if (netMatcher.find()) {
                String net = netMatcher.group(1).replace(",", ".");
                try {
                    fields.put("salaireNet", Double.parseDouble(net));
                } catch (NumberFormatException e) {
                    fields.put("salaireNet", net);
                }
            }
        }

        // === PASSPORT ===
        if (documentType.equals("PASSPORT")) {
            // Recherche du numéro de passeport
            Pattern passportPattern = Pattern.compile("(?:Passport|Passeport|PASSPORT)\\s*[:]?\\s*([A-Z0-9]+)");
            Matcher passportMatcher = passportPattern.matcher(cleanText);
            if (passportMatcher.find()) {
                fields.put("passportNumber", passportMatcher.group(1).trim());
            }

            // Recherche de la nationalité
            Pattern nationalityPattern = Pattern.compile("(?:Nationalité|Nationality|nationalite)\\s*[:]?\\s*([A-Za-zÀ-ÿ]+)");
            Matcher nationalityMatcher = nationalityPattern.matcher(cleanText);
            if (nationalityMatcher.find()) {
                fields.put("nationalite", nationalityMatcher.group(1).trim());
            }
        }

        // Si aucun champ n'a été trouvé, ajouter au moins le texte brut
        if (fields.isEmpty()) {
            fields.put("message", "Aucune donnée structurée n'a pu être extraite");
            fields.put("rawText", text);
        }

        return fields;
    }
}