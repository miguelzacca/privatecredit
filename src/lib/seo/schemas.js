const BASE_URL = 'https://privateecredit.vercel.app'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LOGO Marketplace Financeiro',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+55-11-0000-0000',
    contactType: 'customer service',
    areaServed: 'BR',
    availableLanguage: 'Portuguese',
  },
}

export const financialServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'LOGO Crédito Privado',
  image: `${BASE_URL}/og-image.jpg`,
  url: BASE_URL,
  telephone: '+55-11-0000-0000',
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida Faria Lima, 1234',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    postalCode: '01452-000',
    addressCountry: 'BR',
  },
  description:
    'Marketplace de Crédito Privado e Antecipação de Recebíveis para empresas, construtoras e corretores.',
}

export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LOGO',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

// Ready for future FAQ implementation
export const generateFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

export const generateBreadcrumbsSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
})
