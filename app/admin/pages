// app/admin/pages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPages(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Páginas</h1>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{page.title}</h2>
                <p className="text-gray-600 text-sm mb-3">/{page.slug}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {page.status}
                  </span>
                  <span>Template: {page.template_type}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  👁️ Ver
                </Link>
                <Link
                  href={`/admin/pages/${page.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
