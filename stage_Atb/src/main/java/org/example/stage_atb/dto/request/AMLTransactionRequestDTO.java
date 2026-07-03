package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AMLTransactionRequestDTO {

    private String clientId;
    private String transactionReference;
    private BigDecimal amount;
    private String currency;
    private TransactionType transactionType;
    private String senderAccount;
    private String receiverAccount;
    private String senderName;
    private String receiverName;
    private String senderBank;
    private String receiverBank;
    private String transactionDescription;
    private LocalDateTime transactionDate;
}