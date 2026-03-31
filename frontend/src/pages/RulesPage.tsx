import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getRules, deleteRule, updateRule } from '@/api/client'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Rule {
  id: number
  name: string
  description: string
  mediaType: string
  enabled: boolean
  cronExpression: string
}

export function RulesPage() {
  const navigate = useNavigate()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRules = async () => {
    try {
      const res = await getRules()
      setRules(res.data)
    } catch {
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRules() }, [])

  const handleToggle = async (rule: Rule) => {
    try {
      await updateRule(rule.id, { ...rule, enabled: !rule.enabled })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    try {
      await deleteRule(id)
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rules</h2>
          <p className="text-muted-foreground">Manage your cleanup rules</p>
        </div>
        <Button onClick={() => navigate('/rules/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground">No rules configured</p>
            <p className="text-sm text-muted-foreground">Create a rule to start managing your media library.</p>
            <Button className="mt-4" onClick={() => navigate('/rules/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {rule.name}
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule)} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{rule.mediaType}</Badge>
                    <span>{rule.cronExpression}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/rules/${rule.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
