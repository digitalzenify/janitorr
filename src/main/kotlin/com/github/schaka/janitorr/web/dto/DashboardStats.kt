package com.github.schaka.janitorr.web.dto

import java.time.LocalDateTime

data class DashboardStats(
    val totalRules: Long,
    val itemsDeletedLast7Days: Long,
    val itemsDeletedLast30Days: Long,
    val storageReclaimedBytes: Long,
    val nextCleanupTime: LocalDateTime?,
    val dryRun: Boolean
)
