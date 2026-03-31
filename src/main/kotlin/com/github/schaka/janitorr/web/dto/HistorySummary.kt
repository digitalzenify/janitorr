package com.github.schaka.janitorr.web.dto

data class HistorySummary(
    val totalItems: Long,
    val storageFreedBytes: Long,
    val mostActiveRule: String?
)
