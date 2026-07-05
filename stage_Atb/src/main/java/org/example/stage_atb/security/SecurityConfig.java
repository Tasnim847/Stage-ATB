package org.example.stage_atb.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.multipart.support.MultipartFilter;

import java.util.Arrays;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public MultipartFilter multipartFilter() {
        MultipartFilter multipartFilter = new MultipartFilter();
        multipartFilter.setMultipartResolverBeanName("multipartResolver");
        return multipartFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://127.0.0.1:4200"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control",
                "Origin",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Headers",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Credentials"
        ));
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(multipartFilter(), JwtAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ============================================
                        // 1. ENDPOINTS PUBLICS
                        // ============================================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // ============================================
                        // 2. RÈGLES SPÉCIFIQUES - CLIENT
                        // ============================================

                        // ✅ CLIENT peut voir ses propres informations
                        .requestMatchers("/api/clients/me").hasRole("CLIENT")

                        // ✅ CLIENT peut voir ses propres crédits
                        .requestMatchers("/api/credit-requests/my-credits/**").hasRole("CLIENT")
                        .requestMatchers("/api/credit-requests/my-credits").hasRole("CLIENT")

                        // ✅ CLIENT peut créer des demandes de crédit (POST)
                        .requestMatchers(HttpMethod.POST, "/api/credit-requests").hasRole("CLIENT")

                        // ✅ CLIENT peut voir la simulation de son crédit
                        .requestMatchers("/api/credit-requests/*/simulation").hasRole("CLIENT")


                        // ============================================
                        // 3. RÈGLES GÉNÉRIQUES
                        // ============================================

                        // ADMIN uniquement
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/role/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/count/active").hasRole("ADMIN")

                        // ANALYST et ADMIN
                        .requestMatchers("/api/financial-analysis/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/risk-analysis/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/fraud-alerts/**").hasAnyRole("ANALYST", "ADMIN")

                        // ADVISOR, ANALYST, ADMIN - Clients
                        .requestMatchers("/api/clients/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers("/api/clients/advisor/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")

                        // ANALYST, ADMIN - Gestion complète des crédits
                        .requestMatchers("/api/credit-requests/**").hasAnyRole("ANALYST", "ADMIN")

                        // Copilot (Premium)
                        .requestMatchers("/api/copilot/**").hasAnyRole("ANALYST", "ADMIN")

                        // KYC
                        .requestMatchers("/api/kyc/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")

                        // ============================================
                        // 4. AUTHENTIFIÉ UNIQUEMENT
                        // ============================================
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // ============================================
                        // 5. TOUTE AUTRE REQUÊTE
                        // ============================================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider());

        return http.build();
    }
}