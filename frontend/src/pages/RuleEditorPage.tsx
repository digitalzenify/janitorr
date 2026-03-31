import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getRule, createRule, updateRule } from '@/api/client'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'

interface Condition {
  property: string
  operator: string
  value: string
}

interface RuleForm {
  name: string
  description: string
  mediaType: string
  cronExpression: string
  gracePeriodDays: number
  conditions: Condition[]
  actions: string[]
}

const emptyForm: RuleForm = {
  name: '',
  description: '',
  mediaType: 'movie',
  cronExpression: '0 0 3 * * ?',
  gracePeriodDays: 14,
  conditions: [],
  actions: ['delete'],
}

export function RuleEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = id !== undefined
  const [form, setForm] = useState<RuleForm>(emptyForm)
  const [loading, setLoading] = useState(isEditing)

  useEffect(() => {
    if (isEditing) {
      getRule(Number(id))
        .then((res) => setForm(res.data))
        .catch(() => navigate('/rules'))
        .finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate])

  const updateField = <K extends keyof RuleForm>(key: K, value: RuleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addCondition = () => {
    updateField('conditions', [...form.conditions, { property: '', operator: 'equals', value: '' }])
  }

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = form.conditions.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    updateField('conditions', updated)
  }

  const removeCondition = (index: number) => {
    updateField('conditions', form.conditions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      if (isEditing) {
        await updateRule(Number(id), form)
      } else {
        await createRule(form)
      }
      navigate('/rules')
    } catch {
      // ignore
    }
  }

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/rules')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Rule' : 'Create Rule'}</h2>
          <p className="text-muted-foreground">{isEditing ? 'Modify your cleanup rule' : 'Define a new cleanup rule'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Rule name" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="What does this rule do?" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Media Type</label>
              <Select value={form.mediaType} onChange={(e) => updateField('mediaType', e.target.value)}>
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
                <option value="all">All</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule &amp; Grace Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cron Expression</label>
              <Input value={form.cronExpression} onChange={(e) => updateField('cronExpression', e.target.value)} placeholder="0 0 3 * * ?" />
              <p className="mt-1 text-xs text-muted-foreground">Standard cron format for scheduling runs</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Grace Period (days)</label>
              <Input type="number" value={form.gracePeriodDays} onChange={(e) => updateField('gracePeriodDays', Number(e.target.value))} />
              <p className="mt-1 text-xs text-muted-foreground">Days to wait before taking action</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Actions</label>
              <Select value={form.actions[0] ?? 'delete'} onChange={(e) => updateField('actions', [e.target.value])}>
                <option value="delete">Delete</option>
                <option value="unmonitor">Unmonitor</option>
                <option value="tag">Tag Only</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Conditions</CardTitle>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </CardHeader>
        <CardContent>
          {form.conditions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conditions defined. The rule will apply to all matching media.</p>
          ) : (
            <div className="space-y-3">
              {form.conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={condition.property} onChange={(e) => updateCondition(index, 'property', e.target.value)} className="flex-1">
                    <option value="">Select property…</option>
                    <option value="age">Age (days)</option>
                    <option value="rating">Rating</option>
                    <option value="size">Size (GB)</option>
                    <option value="lastWatched">Last Watched (days ago)</option>
                    <option value="genre">Genre</option>
                  </Select>
                  <Select value={condition.operator} onChange={(e) => updateCondition(index, 'operator', e.target.value)} className="w-40">
                    <option value="equals">Equals</option>
                    <option value="greaterThan">Greater Than</option>
                    <option value="lessThan">Less Than</option>
                    <option value="contains">Contains</option>
                  </Select>
                  <Input value={condition.value} onChange={(e) => updateCondition(index, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/rules')}>Cancel</Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </div>
  )
}
