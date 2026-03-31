package com.github.schaka.janitorr.web.data

import org.springframework.data.jpa.repository.JpaRepository

interface RuleRepository : JpaRepository<Rule, Long>
