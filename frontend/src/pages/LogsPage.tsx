import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Client } from '@stomp/stompjs'

interface LogEntry {
  id: number
  timestamp: string
  level: string
  logger: string
  message: string
}

const levelColors: Record<string, string> = {
  ERROR: 'text-red-400',
  WARN: 'text-yellow-400',
  INFO: 'text-blue-400',
  DEBUG: 'text-gray-400',
}

const levelBadgeVariant: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  ERROR: 'destructive',
  WARN: 'default',
  INFO: 'secondary',
  DEBUG: 'outline',
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [connected, setConnected] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)
  const logIdRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [autoScroll])

  useEffect(() => {
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/logs', (message) => {
          try {
            const entry = JSON.parse(message.body) as Omit<LogEntry, 'id'>
            logIdRef.current += 1
            const MAX_LOG_ENTRIES = 1000
            setLogs((prev) => [...prev.slice(-(MAX_LOG_ENTRIES - 1)), { ...entry, id: logIdRef.current }])
          } catch {
            // invalid message
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    return () => { client.deactivate() }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [logs, scrollToBottom])

  const filteredLogs = logs.filter((log) => {
    if (filter && log.level !== filter) return false
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.logger.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
        <p className="text-muted-foreground">
          Real-time log stream
          <Badge variant={connected ? 'default' : 'destructive'} className="ml-2">
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Log Stream</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <Button
                  variant={filter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(null)}
                >
                  All
                </Button>
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={filter === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filter === level ? null : level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Search logs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-scroll</span>
                <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] overflow-y-auto rounded-md bg-background p-4 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground">
                {connected ? 'Waiting for log messages…' : 'Connect to start receiving logs.'}
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex gap-2 py-0.5 hover:bg-muted/50">
                  <span className="shrink-0 text-muted-foreground">{log.timestamp}</span>
                  <Badge variant={levelBadgeVariant[log.level] ?? 'outline'} className="shrink-0 text-[10px]">
                    {log.level}
                  </Badge>
                  <span className="shrink-0 text-muted-foreground">{log.logger}</span>
                  <span className={levelColors[log.level] ?? 'text-foreground'}>{log.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
