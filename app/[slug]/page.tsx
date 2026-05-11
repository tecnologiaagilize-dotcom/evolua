// app/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  
  const { data: page } = await supabase
    .from('pages')
    .select('meta_title, meta_description, meta_keywords')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!page) return {}

  return {
    title: page.meta_title,
    description: page.meta_description,
    keywords: page.meta_keywords?.join(', ')
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: page, error } = await supabase
    .from('pages')
    .select(`
      *,
      sections:page_sections(
        *,
        media:page_media(*),
        ctas:page_ctas(*)
      )
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !page) {
    notFound()
  }

  // Ordenar seções
  const sections = (page.sections || []).sort((a: any, b: any) => 
    a.section_order - b.section_order
  )

  return (
    <main className="min-h-screen">
      <h1 className="text-4xl font-bold text-center py-12">{page.title}</h1>
      
      {/* Por enquanto apenas mostra o título, 
          depois vamos adicionar as seções */}
      {sections.map((section: any) => (
        <div key={section.id} className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
          {section.subtitle && (
            <p className="text-lg text-gray-600">{section.subtitle}</p>
          )}
        </div>
      ))}
    </main>
  )
}

// Gerar páginas estáticas
export async function generateStaticParams() {
  const supabase = createClient()
  
  const { data: pages } = await supabase
    .from('pages')
    .select('slug')
    .eq('status', 'published')

  return pages?.map((page) => ({
    slug: page.slug,
  })) || []
}

