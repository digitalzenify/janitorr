package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.web.data.Rule
import com.github.schaka.janitorr.web.data.RuleRepository
import com.github.schaka.janitorr.web.dto.RuleDto
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@RestController
@CrossOrigin
@RequestMapping("/api/rules")
class RuleController(
    private val ruleRepository: RuleRepository
) {

    @GetMapping
    fun listRules(): ResponseEntity<List<Rule>> {
        return ResponseEntity.ok(ruleRepository.findAll())
    }

    @PostMapping
    fun createRule(@RequestBody dto: RuleDto): ResponseEntity<Rule> {
        val rule = Rule(
            name = dto.name,
            description = dto.description,
            mediaType = dto.mediaType,
            enabled = dto.enabled,
            cronExpression = dto.cronExpression,
            gracePeriodDays = dto.gracePeriodDays,
            conditionsJson = dto.conditionsJson,
            actionsJson = dto.actionsJson,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleRepository.save(rule))
    }

    @GetMapping("/{id}")
    fun getRule(@PathVariable id: Long): ResponseEntity<Rule> {
        val rule = ruleRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found with id: $id") }
        return ResponseEntity.ok(rule)
    }

    @PutMapping("/{id}")
    fun updateRule(@PathVariable id: Long, @RequestBody dto: RuleDto): ResponseEntity<Rule> {
        val existing = ruleRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found with id: $id") }

        existing.name = dto.name
        existing.description = dto.description
        existing.mediaType = dto.mediaType
        existing.enabled = dto.enabled
        existing.cronExpression = dto.cronExpression
        existing.gracePeriodDays = dto.gracePeriodDays
        existing.conditionsJson = dto.conditionsJson
        existing.actionsJson = dto.actionsJson
        existing.updatedAt = LocalDateTime.now()

        return ResponseEntity.ok(ruleRepository.save(existing))
    }

    @DeleteMapping("/{id}")
    fun deleteRule(@PathVariable id: Long): ResponseEntity<Void> {
        if (!ruleRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found with id: $id")
        }
        ruleRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}
