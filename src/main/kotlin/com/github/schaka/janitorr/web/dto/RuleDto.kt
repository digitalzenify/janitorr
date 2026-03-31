package com.github.schaka.janitorr.web.dto

import com.github.schaka.janitorr.web.data.MediaTypeFilter

data class RuleDto(
    val name: String,
    val description: String = "",
    val mediaType: MediaTypeFilter = MediaTypeFilter.BOTH,
    val enabled: Boolean = true,
    val cronExpression: String = "0 0 3 * * *",
    val gracePeriodDays: Int = 14,
    val conditionsJson: String = "[]",
    val actionsJson: String = "[]"
)
