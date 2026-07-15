import React from 'react';
import { Helmet } from 'react-helmet-async';

export function SEOManager({
  title = "LOGO | Premium Private Credit Marketplace",
  description = "A infraestrutura definitiva para operações de crédito e recebíveis. Conectamos originadores de alto padrão a investidores qualificados.",
  canonical = "https://privateecredit.vercel.app", // Replace with your actual domain
  type = "website",
  image = "/og-image.jpg", // Create an og-image.jpg in the public folder
  siteName = "LOGO Marketplace Financeiro",
  locale = "pt_BR",
  keywords = "Marketplace de Crédito, Crédito Privado, Investidor, Capital de Giro, Antecipação de Comissão, Crédito Empresarial, Recebíveis",
}) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
