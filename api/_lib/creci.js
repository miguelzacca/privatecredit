/**
 * CRECI-SC Validation Service
 * Validates a CPF against the CRECI-SC registry by scraping the conselho website.
 */

const CRECI_URL =
  'https://www.crecisc.conselho.net.br/form_pesquisa_cadastro_geral_site.php';

const CRECI_TOKEN =
  '0.AQm-6t-MbVz5bu5QOHhgN42yZk35b95KUMrIfIQPx3r-IfWHpgm_M0BxKilXGyCApmCIEmp_sjiwEujaQpKx_YqehB_mttK3uS0yrgeUERa8iD0G3C9RdDh9kEjEguAb6qApL5cjg1oCPDC730FtMz6YcZSXDmdbHRI9qI3rvdXPws7AIFqYJPOPDTfzbv0_dDfL3wDeIavDVL0faxT0t6-OKrkLUcutejsB5NszDLADT2eBd6hcfpz96B8efW_wutlZ4l66FSBOys0YwHTy5My4aTwXeDbv9bZfWr_4cskZkGh3Wjl7qUn2m1IlH4E609igW7xoMuBZpkrkGO1xEh_tI3CMv833IFUPqBp4VqOh46Gg9ntSICPeQVJ_LO_J6207fxS2Mzst7HduMix9lUxs34RkRMwrRYPsMPYFpIKjwsmPPffSUcVvSE2bIj0cacIJNW7NMBhQEngLHYIht2Dwr0tlujx7olfDmgf6iOqBxhgH-tTL_zOjPKwtNxbRsMjFDX67r8W5ydBDk3vcN9q14NNg9xerprBzLDo_HqFCZMRWCgXNykQQ1dzYCEC3aHJept0woNwbGb7zcjxA6VAjntMbIAQypVzxy-XEIbptY8zqFaKtpbzoM1JTJh9olt8fJQ6ur9Zx8f5AA4x9vgdlLFo1L-r-fAnZrbxrDNUTSdP7BYyOgkAgQcF6U0gWwkV1zujcTkfqttpClBS54faCHjwTbddiAeICqsOr5-uFaMOxbphR761DnomwnSUVPwemnxX5Rijk509JDH1MPvAqsobpuXgVLIW2qvle5tDYSa0JSeAcZynQJt50QcoIYZZFB8d5SZBWs8_JM6cEFH_86x7eTb76GDQ3alBGE7O8B1iuwcqfQFP7V3wn8kXw5WsGw4oKwao7Izd1-1AMu27PeNsu-v2_dK8ZumaTTbNgcm2N0bZCaEQWKboqd2Tk._6xFrdoXNtOz1s17bUSpVA.f9443f99055d6cd31b73c1517f39c3293644da49e86e82f14887924e7e1d6e62';

/**
 * Validates a CPF against the CRECI-SC registry.
 * @param {string} cpf - The CPF (digits only or formatted)
 * @returns {Promise<{active: boolean, name: string|null, error: string|null}>}
 */
export async function validateCreciByCpf(cpf) {
  const cpfDigits = cpf.replace(/\D/g, '');

  const creciRes = await fetch(CRECI_URL, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9,pt;q=0.8',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
      pragma: 'no-cache',
      'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    },
    referrer: CRECI_URL,
    body: `cpf=${cpfDigits}&token=${CRECI_TOKEN}`,
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
  });

  const html = await creciRes.text();

  if (html.includes('Calma! Aguarde alguns segundos')) {
    return {
      active: false,
      name: null,
      error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.',
    };
  }

  if (!html.includes('ATIVO')) {
    return {
      active: false,
      name: null,
      error:
        'CPF não encontrado no CRECI-SC ou registro inativo. Verifique se seu CRECI-SC está regularizado e tente novamente.',
    };
  }

  const regex = /<td>\s*<div>([^<]+)<\/div>\s*<div class="q-gutter-x-xs">/i;
  const match = html.match(regex);
  const name = match && match[1] ? match[1].trim() : 'Corretor(a) Ativo(a)';

  return { active: true, name, error: null };
}
