package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.web.dto.LogMessage
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

@Service
class LogWebSocketService(
    private val messagingTemplate: SimpMessagingTemplate
) {

    private val listener: (LogMessage) -> Unit = { logMessage ->
        messagingTemplate.convertAndSend("/topic/logs", logMessage)
    }

    @PostConstruct
    fun init() {
        WebSocketLogAppender.addListener(listener)
    }

    @PreDestroy
    fun destroy() {
        WebSocketLogAppender.removeListener(listener)
    }
}
