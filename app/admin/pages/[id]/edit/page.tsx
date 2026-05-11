// app/admin/pages/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PageEditor({ params }: { params: { id: string } }) {
  const [page, setPage] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPage()
  }, [params.id])

  async function loadPage() {
    const { data, error } = await supabase
      .from('pages')
      .select(`
        *,
        sections:page_sections(*)
      `)
      .eq('id', params.id)
      .single()

    if (!error && data) {
      setPage(data)
      setSections(data.sections?.sort((a: any, b: any) => 
        a.section_order - b.section_order
      ) || [])
    }
    setLoading(false)
  }

  async function savePage() {
    setSaving(true)

    await supabase
      .from('pages')
      .update({
        title: page.title,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
      })
      .eq('id', params.id)

    for (const section of sections) {
      if (section.id.startsWith('new-')) {
        await supabase
          .from('page_sections')
          .insert({
            page_id: params.id,
            section_type: section.section_type,
            section_order: section.section_order,
            title: section.title,
            subtitle: section.subtitle,
            content: section.content || {},
            settings: section.settings || {},
            is_active: true
          })
      } else {
        await supabase
          .from('page_sections')
          .update({
            title: section.title,
            subtitle: section.subtitle,
            content: section.content,
            section_order: section.section_order
          })
          .eq('id', section.id)
      }
    }

    setSaving(false)
    alert('Página salva!')
  }

  function addSection(type: string) {
    const newSection = {
      id: `new-${Date.now()}`,
      page_id: params.id,
      section_type: type,
      section_order: sections.length,
      title: '',
      subtitle: '',
      content: {},
      settings: {}
    }
    setSections([...sections, newSection])
  }

  function updateSection(index: number, field: string, value: any) {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  function deleteSection(index: number) {
    if (confirm('Excluir esta seção?')) {
      const newSections = sections.filter((_, i) => i !== index)
      setSections(newSections)
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">{page.title}</h1>
            <p className="text-sm text-gray-600">/{page.slug}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/pages')}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              onClick={savePage}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Configurações</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Título</label>
                  <input
                    type="text"
                    value={page.meta_title || ''}
                    onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <h4 className="font-medium mb-2">Adicionar Seção</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('hero')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Hero
                </button>
                <button
                  onClick={() => addSection('text')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Texto
                </button>
                <button
                  onClick={() => addSection('features')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Features
                </button>
                <button
                  onClick={() => addSection('form')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Form
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="space-y-4">
              {sections.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center">
                  <p className="text-gray-500">Nenhuma seção. Use o menu lateral para adicionar.</p>
                </div>
              ) : (
                sections.map((section, index) => (
                  <div key={section.id} className="bg-white rounded-lg border p-6">
                    <div className="flex justify-between mb-4">
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                        {section.section_type}
                      </span>
                      <button
                        onClick={() => deleteSection(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Excluir
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="Ex: Harmonização Facial Premium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Subtítulo</label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => updateSection(index, 'subtitle', e.target.value)}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="Ex: Resultados naturais garantidos"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
