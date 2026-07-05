// dto/request/PasswordUpdateRequest.java
package org.example.stage_atb.dto.request;

import lombok.Data;

@Data
public class PasswordUpdateRequest {
    private String currentPassword;
    private String newPassword;
}