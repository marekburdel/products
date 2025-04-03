package cz.burdemar.products.products.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shopOpenAPI() {
        return new OpenAPI()
                .openapi("3.0.1")  // Explicitly set the OpenAPI version
                .info(new Info()
                        .title("Shop API")
                        .description("RESTful API for managing products and orders")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Products API")
                                .email(""))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}