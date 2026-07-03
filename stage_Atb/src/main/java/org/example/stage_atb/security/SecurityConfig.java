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

    /**
     * Configuration de l'AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configuration du PasswordEncoder avec BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configuration du filtre Multipart pour les uploads de fichiers
     */
    @Bean
    public MultipartFilter multipartFilter() {
        MultipartFilter multipartFilter = new MultipartFilter();
        multipartFilter.setMultipartResolverBeanName("multipartResolver");
        return multipartFilter;
    }

    /**
     * Configuration CORS complète pour Angular
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ========== ORIGINES AUTORISÉES ==========
        // Solution 1: Origines explicites (Recommandée)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://127.0.0.1:4200"
        ));

        // Solution 2: Patterns (pour plus de flexibilité)
        // configuration.setAllowedOriginPatterns(Arrays.asList(
        //     "http://localhost:*",
        //     "http://127.0.0.1:*"
        // ));

        // ========== MÉTHODES HTTP AUTORISÉES ==========
        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS",
                "HEAD"
        ));

        // ========== HEADERS AUTORISÉS ==========
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

        // ========== HEADERS EXPOSÉS ==========
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        // ========== CREDENTIALS ==========
        configuration.setAllowCredentials(true);

        // ========== DURÉE DE VIE DU CACHE CORS ==========
        configuration.setMaxAge(3600L);

        // ========== APPLICATION DE LA CONFIGURATION ==========
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configuration du Provider d'authentification
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configuration principale de la sécurité
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ========== 1. CONFIGURATION CORS ==========
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ========== 2. DÉSACTIVATION CSRF (API REST) ==========
                .csrf(csrf -> csrf.disable())

                // ========== 3. FILTRES ==========
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(multipartFilter(), JwtAuthenticationFilter.class)

                // ========== 4. AUTHORISATIONS ==========
                .authorizeHttpRequests(auth -> auth

                        // ----- 4.1. OPTIONS pour CORS -----
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ----- 4.2. Endpoints publics -----
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // ----- 4.3. Swagger / OpenAPI -----
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()

                        // ----- 4.4. Actuator (Monitoring) -----
                        .requestMatchers("/actuator/**").permitAll()

                        // ----- 4.5. Uploads -----
                        .requestMatchers("/uploads/**").permitAll()

                        // ========================================
                        // 4.6. ROLES ET PERMISSIONS
                        // ========================================

                        // ----- ADMIN uniquement -----
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/role/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/count/active").hasAuthority("ADMIN")

                        // ----- ANALYST et ADMIN -----
                        .requestMatchers("/api/analyst/**").hasAnyAuthority("ANALYST", "ADMIN")
                        .requestMatchers("/api/financial-analysis/**").hasAnyAuthority("ANALYST", "ADMIN")
                        .requestMatchers("/api/risk-analysis/**").hasAnyAuthority("ANALYST", "ADMIN")
                        .requestMatchers("/api/fraud-alerts/**").hasAnyAuthority("ANALYST", "ADMIN")

                        // ----- ADVISOR, ANALYST et ADMIN -----
                        .requestMatchers("/api/advisor/**").hasAnyAuthority("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers("/api/clients/**").hasAnyAuthority("ADVISOR", "ANALYST", "ADMIN")

                        // ----- Copilot (Premium) -----
                        .requestMatchers("/api/copilot/**").hasAnyAuthority("ANALYST", "ADMIN")

                        // ----- KYC -----
                        .requestMatchers("/api/kyc/**").hasAnyAuthority("ADVISOR", "ANALYST", "ADMIN")

                        // ----- Notifications -----
                        .requestMatchers("/api/notifications/**").authenticated()

                        // ----- Dashboard -----
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // ----- Credit Requests -----
                        .requestMatchers("/api/credit-requests/**").authenticated()

                        // ----- Credit Requests -----
                        .requestMatchers("/api/credit-requests/**").authenticated()

                        // ========================================
                        // 4.7. Toute autre requête
                        // ========================================
                        .anyRequest().authenticated()
                )

                // ========== 5. SESSION STATELESS (JWT) ==========
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ========== 6. PROVIDER D'AUTHENTIFICATION ==========
                .authenticationProvider(authenticationProvider());

        return http.build();
    }
}