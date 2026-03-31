package com.github.schaka.janitorr.web.dto

import java.time.LocalDateTime

data class LogMessage(
    val level: String,
    val message: String,
    val timestamp: LocalDateTime,
    val loggerName: String
)
