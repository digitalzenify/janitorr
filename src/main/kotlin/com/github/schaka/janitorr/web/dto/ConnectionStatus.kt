package com.github.schaka.janitorr.web.dto

data class ConnectionStatus(
    val service: String,
    val url: String,
    val enabled: Boolean,
    val reachable: Boolean,
    val message: String
)
