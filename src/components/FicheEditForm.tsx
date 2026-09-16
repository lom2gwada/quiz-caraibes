import { useState } from 'react'
import type { FormEvent } from 'react'
import type { GenSchema, Row } from '../utils/quizGenerator'
import { useT } from '../i18n'
import { updateCaribbeanRow } from '../utils/caribbeanDataset'

interface FicheEditFormProps {
  row: Row
  schema: GenSchema
  onSaved: (updatedRow: Row) => void
  onCancel: () => void
}

/** Formulaire d'édition admin d'un territoire (quiz_forge_caribbean_dataset) : un champ texte par
 *  colonne incluse, sauf le sujet et l'article — renommer un territoire sortirait du périmètre
 *  (shapes/region/i18n/aliases restent indexés par le nom exact). Valeurs brutes (non traduites) :
 *  ce sont elles qui sont stockées en base, indépendamment de la langue d'affichage. */
export function FicheEditForm({ row, schema, onSaved, onCancel }: FicheEditFormProps) {
  const t = useT()
  const { subjectColumn, articleColumn, columns } = schema
  const editableCols = Object.entries(columns).filter(([c, s]) => s.include && c !== subjectColumn && c !== articleColumn)
  const [values, setValues] = useState<Row>(() => Object.fromEntries(editableCols.map(([c]) => [c, row[c] ?? ''])))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (col: string, value: string) => setValues((previous) => ({ ...previous, [col]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const canonical = row[subjectColumn] ?? ''
      await updateCaribbeanRow(canonical, values)
      onSaved({ ...row, ...values })
    } catch {
      setError(t('fiche.editError'))
    } finally {
      setSaving(false)
    }
  }

  return <form className="fiche-edit-form" onSubmit={submit}>
    {editableCols.map(([col, spec]) => (
      <label key={col}>
        {spec.label}
        <input value={values[col] ?? ''} onChange={(event) => setField(col, event.target.value)} />
      </label>
    ))}
    {error && <p className="alert" role="alert">{error}</p>}
    <div className="fiche-edit-actions">
      <button type="button" className="secondary" onClick={onCancel} disabled={saving}>{t('common.cancel')}</button>
      <button type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
    </div>
  </form>
}
