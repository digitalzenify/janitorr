package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.web.dto.LogMessage
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.AppenderBase
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.CopyOnWriteArrayList

class WebSocketLogAppender : AppenderBase<ILoggingEvent>() {

    companion object {
        private val listeners = CopyOnWriteArrayList<(LogMessage) -> Unit>()

        fun addListener(listener: (LogMessage) -> Unit) {
            listeners.add(listener)
        }

        fun removeListener(listener: (LogMessage) -> Unit) {
            listeners.remove(listener)
        }
    }

    override fun append(eventObject: ILoggingEvent) {
        val timestamp = LocalDateTime.ofInstant(
            Instant.ofEpochMilli(eventObject.timeStamp),
            ZoneId.systemDefault()
        )
        val msg = LogMessage(
            level = eventObject.level.toString(),
            message = eventObject.formattedMessage,
            timestamp = timestamp,
            loggerName = eventObject.loggerName
        )
        listeners.forEach { it(msg) }
    }
}
