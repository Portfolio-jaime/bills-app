'use client'

import { useState } from 'react'
import {
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/queries/categories'
import { Button, Input } from '@bills/ui'
import type { Category, CreateCategoryDto } from '@bills/types'
import { getCategoryIcon } from '@/lib/categoryIcons'
import { Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'EXPENSE', label: '↓ Expense', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { value: 'INCOME', label: '↑ Income', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'BOTH', label: '⇄ Both', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
] as const

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#84cc16', '#f59e0b', '#f97316',
  '#ef4444', '#ec4899', '#8b5cf6', '#a855f7', '#64748b',
]

const PRESET_ICONS = [
  '🏠', '🍔', '🚗', '💊', '🎮', '🛍️', '📚', '💡', '✈️', '💳',
  '💼', '💻', '📈', '💰', '🎁', '🐶', '🏋️', '☕', '🎬', '📱',
  '🛒', '🎓', '🏥', '⚽', '🤝', '📦', '↔️', '🏦', '₿', '🔒',
]

// ─── Category form (inline) ───────────────────────────────────────────────────

interface CategoryFormProps {
  initial?: Partial<CreateCategoryDto>
  parentId?: string
  onSave: (dto: CreateCategoryDto) => void
  onCancel: () => void
  isPending: boolean
}

function CategoryForm({ initial, parentId, onSave, onCancel, isPending }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '')
  const [color, setColor] = useState(initial?.color ?? '#6366f1')
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'BOTH'>(
    (initial?.type as any) ?? 'EXPENSE',
  )
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) return setError('Name is required')
    setError('')
    onSave({ name: name.trim(), icon: icon || undefined, color, type, parentId })
  }

  return (
    <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
      {/* Name + Type */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="h-10 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={!!parentId}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Icon picker */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIconPicker((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-lg">{icon || '📦'}</span>
            Icon {showIconPicker ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {icon && (
            <button
              type="button"
              onClick={() => setIcon('')}
              className="text-xs text-muted-foreground hover:text-rose-400"
            >
              clear
            </button>
          )}
        </div>
        {showIconPicker && (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/30 border border-border">
            {PRESET_ICONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { setIcon(em); setShowIconPicker(false) }}
                className={`text-lg p-1 rounded hover:bg-accent transition-colors ${icon === em ? 'ring-2 ring-indigo-500' : ''}`}
              >
                {em}
              </button>
            ))}
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="custom"
              className="w-20 h-8 text-sm"
              maxLength={10}
            />
          </div>
        )}
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Color:</span>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-5 w-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-5 w-5 rounded-full border border-border cursor-pointer bg-transparent"
          title="Custom color"
        />
        <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: color }} />
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-1">
          <Check className="h-3.5 w-3.5" />
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ─── Single category row ──────────────────────────────────────────────────────

interface CategoryRowProps {
  cat: Category
  depth?: number
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onAddSub: (parentId: string, type: string) => void
}

function CategoryRow({ cat, depth = 0, onEdit, onDelete, onAddSub }: CategoryRowProps) {
  const typeOption = TYPE_OPTIONS.find((t) => t.value === cat.type)
  const icon = cat.icon || getCategoryIcon({ name: cat.name, type: cat.type })

  return (
    <>
      <tr className="group border-b border-border hover:bg-muted/10 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && <span className="text-muted-foreground/40 text-xs">└</span>}
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: (cat.color ?? '#6366f1') + '25' }}
            >
              {icon}
            </div>
            <span className="text-sm font-medium text-foreground">{cat.name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${typeOption?.color}`}>
            {typeOption?.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color ?? '#6366f1' }} />
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {depth === 0 && (
              <button
                onClick={() => onAddSub(cat.id, cat.type)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors"
                title="Add subcategory"
              >
                + sub
              </button>
            )}
            <button
              onClick={() => onEdit(cat)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(cat)}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {cat.children?.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSub={onAddSub}
        />
      ))}
    </>
  )
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────

function DeleteConfirm({ cat, onConfirm, onCancel, isPending }: {
  cat: Category
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Delete category?</h3>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{cat.icon} {cat.name}</strong> will be permanently deleted.
          Transactions linked to it will become uncategorised.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Mode =
  | { kind: 'idle' }
  | { kind: 'create'; parentId?: string; parentType?: string }
  | { kind: 'edit'; cat: Category }
  | { kind: 'delete'; cat: Category }

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useAllCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [mode, setMode] = useState<Mode>({ kind: 'idle' })
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'BOTH'>('ALL')

  const filtered = filter === 'ALL' ? categories : categories.filter((c) => c.type === filter)

  const handleCreate = async (dto: CreateCategoryDto) => {
    await createMutation.mutateAsync(dto)
    setMode({ kind: 'idle' })
  }

  const handleUpdate = async (dto: CreateCategoryDto) => {
    if (mode.kind !== 'edit') return
    await updateMutation.mutateAsync({ id: mode.cat.id, dto })
    setMode({ kind: 'idle' })
  }

  const handleDelete = async () => {
    if (mode.kind !== 'delete') return
    await deleteMutation.mutateAsync(mode.cat.id)
    setMode({ kind: 'idle' })
  }

  const totalByType = {
    INCOME: categories.filter((c) => c.type === 'INCOME').length,
    EXPENSE: categories.filter((c) => c.type === 'EXPENSE').length,
    BOTH: categories.filter((c) => c.type === 'BOTH').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organise your transactions and budgets
          </p>
        </div>
        <Button
          onClick={() => setMode({ kind: 'create' })}
          className="gap-1 flex-shrink-0"
          disabled={mode.kind !== 'idle'}
        >
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Expense', count: totalByType.EXPENSE, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
          { label: 'Income', count: totalByType.INCOME, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Both', count: totalByType.BOTH, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} p-4 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {mode.kind === 'create' && (
        <CategoryForm
          parentId={mode.parentId}
          initial={mode.parentType ? { type: mode.parentType as any } : undefined}
          onSave={handleCreate}
          onCancel={() => setMode({ kind: 'idle' })}
          isPending={createMutation.isPending}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
        {(['ALL', 'EXPENSE', 'INCOME', 'BOTH'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'ALL' ? `All (${categories.length})` : t}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No categories yet.{' '}
          <button
            onClick={() => setMode({ kind: 'create' })}
            className="underline hover:text-foreground transition-colors"
          >
            Create your first one
          </button>
          .
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Color</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                mode.kind === 'edit' && mode.cat.id === cat.id ? (
                  <tr key={cat.id} className="border-b border-border">
                    <td colSpan={4} className="px-4 py-3">
                      <CategoryForm
                        initial={{ name: cat.name, icon: cat.icon ?? '', color: cat.color ?? '#6366f1', type: cat.type as any }}
                        onSave={handleUpdate}
                        onCancel={() => setMode({ kind: 'idle' })}
                        isPending={updateMutation.isPending}
                      />
                    </td>
                  </tr>
                ) : (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onEdit={(c) => setMode({ kind: 'edit', cat: c })}
                    onDelete={(c) => setMode({ kind: 'delete', cat: c })}
                    onAddSub={(parentId, parentType) =>
                      setMode({ kind: 'create', parentId, parentType })
                    }
                  />
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {mode.kind === 'delete' && (
        <DeleteConfirm
          cat={mode.cat}
          onConfirm={handleDelete}
          onCancel={() => setMode({ kind: 'idle' })}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
