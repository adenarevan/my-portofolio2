// Deterministic development data is unreachable in deployed functions or a real project.
export function developmentProviders() {
  if (!process.env.FIREBASE_PROJECT_ID?.startsWith('demo-') || !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.BOT_TEST_SCENARIO) return {};
  return {
    collect: async (settings, diagnostics) => {
      diagnostics.push({ source: 'Fixture emulator', stage: 'rss', status: 'ok', count: 2 });
      if (process.env.BOT_TEST_SCENARIO === 'empty' || !settings.categories.some(category => ['all', 'ai'].includes(category))) return { candidates: [], stats: { category: 2 } };
      const candidates = [{ title: 'OpenAI merilis GPT-5.2 untuk pengembang', tokens: ['gpt-5.2', 'openai', 'pengembang'], categories: ['ai'], items: [] }];
      if (process.env.BOT_TEST_SCENARIO === 'daily') candidates.push({ title: 'Google Gemini memperkenalkan alat riset', tokens: ['google', 'gemini', 'riset'], categories: ['technology'], items: [] });
      return { candidates, stats: {} };
    },
    readSources: async topic => [
      { id: 'S1', title: 'OpenAI merilis GPT-5.2 untuk pengembang', url: 'https://www.antaranews.com/berita/fixture-emulator', publisher: 'antara', sourceName: 'ANTARA (fixture emulator)', publishedAt: new Date().toISOString(), text: 'Bahan lokal untuk pengujian pengembangan, bukan berita yang diambil dari internet.', material: 'fixture' },
      { id: 'S2', title: 'GPT-5.2 diluncurkan OpenAI bagi pengembang', url: 'https://www.cnnindonesia.com/teknologi/fixture-emulator', publisher: 'ctcorp', sourceName: 'CNN (fixture emulator)', publishedAt: new Date().toISOString(), text: 'Liputan kedua untuk uji alur; ini bukan klaim berita nyata.', material: 'fixture' },
    ].map(source => ({ ...source, url: source.url + (topic.tokens.includes('gemini') ? '-gemini' : '') })),
    generate: async topic => {
      if (process.env.BOT_TEST_SCENARIO === 'failure') throw new Error('Kegagalan API AI dari fixture emulator.');
      return { title: topic.tokens.includes('gemini') ? 'Artikel uji harian: Google Gemini' : 'Draf uji bot: perkembangan AI untuk pengembang', slug: topic.tokens.includes('gemini') ? 'uji-harian-google-gemini' : 'draf-uji-bot-ai-pengembang', excerpt: 'Artikel fixture emulator untuk memeriksa alur draf dan publikasi.', metaDescription: 'Draf pengujian lokal bot artikel AI.', sections: [{ heading: 'Perkembangan yang perlu ditinjau', paragraphs: ['Ini adalah materi uji lokal, bukan laporan berita nyata. Admin dapat mengubah judul dan isi sebelum publikasi melalui editor yang sama.'], sourceIds: ['S1'] }, { heading: 'Langkah sebelum menerbitkan', paragraphs: ['Periksa kembali sumber dan seluruh klaim faktual. Contoh ini hanya membuktikan alur aplikasi dan tidak menguji kualitas penulisan dari API AI sungguhan.'], sourceIds: ['S2'] }] };
    },
  };
}
