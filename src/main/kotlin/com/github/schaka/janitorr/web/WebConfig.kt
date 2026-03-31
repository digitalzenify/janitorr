package com.github.schaka.janitorr.web

import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver

@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // Serve static React frontend assets, falling back to index.html for SPA routing
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(object : PathResourceResolver() {
                override fun getResource(resourcePath: String, location: Resource): Resource? {
                    val requested = location.createRelative(resourcePath)
                    return if (requested.exists() && requested.isReadable) {
                        requested
                    } else {
                        val index = ClassPathResource("/static/index.html")
                        if (index.exists()) index else null
                    }
                }
            })
    }
}
