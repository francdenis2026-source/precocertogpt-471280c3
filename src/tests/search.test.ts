import { describe, it, expect } from 'vitest';
import { normalize } from '../data/remoteCatalog';
import { findSimilarProducts, normalizeSearchText, searchProducts, suggestProducts } from '../lib/productSearch';


describe('Normalização de Busca', () => {
  it('deve normalizar acentos corretamente', () => {
    expect(normalize('Maçã')).toBe('maca');
    expect(normalize('Café')).toBe('cafe');
    expect(normalize('Arroz Tio João')).toBe('arroz tio joao');
  });

  it('deve lidar com espaços extras', () => {
    expect(normalize('  Arroz  ')).toBe('arroz');
  });
});

describe('Busca de produtos por relevância', () => {
  const base = {
    slug: '', category: 'Mercearia', size: '1 kg', unit: 'pacote',
    minPrice: 1, avgPrice: 2, maxPrice: 3, storeCount: 1,
    establishmentId: 1, establishmentSlug: 'loja', establishment: 'Loja',
    neighborhood: 'Centro', storeColor: '#000', capturedAt: new Date().toISOString(),
  };
  const products = [
    { ...base, id: 1, name: 'Arroz Tio João Tipo 1', brand: 'Tio João', minPrice: 29.9 },
    { ...base, id: 2, name: 'Arroz Branco Bernardo', brand: 'Bernardo', minPrice: 6.5 },
    { ...base, id: 3, name: 'Feijão Carioca', brand: 'Kicaldo', minPrice: 8.2 },
  ];

  it('encontra palavras fora da ordem e sem acentos', () => {
    expect(searchProducts(products, 'joao arroz').map(p => p.id)).toEqual([1]);
  });

  it('prioriza a melhor correspondência, não apenas o menor preço', () => {
    expect(searchProducts(products, 'arroz tio')[0].id).toBe(1);
  });

  it('normaliza pontuação e espaços repetidos', () => {
    expect(normalizeSearchText('  Café—500g  ')).toBe('cafe 500g');
  });

  it('prevê nomes por prefixo sem aceitar palavras apenas parecidas', () => {
    expect(suggestProducts(products, 'arr ti').map(p => p.id)).toEqual([1]);
    expect(suggestProducts(products, 'arranha')).toEqual([]);
  });

  it('não sugere produtos apenas porque marca ou categoria se parecem com a busca', () => {
    const branded = [{ ...products[2], id: 8, name: 'Biscoito Cream Cracker', brand: 'Arroz Bom', category: 'Arroz' }];
    expect(suggestProducts(branded, 'arroz')).toEqual([]);
  });

  it('consolida o mesmo produto de lojas diferentes na sugestão', () => {
    const duplicated = [...products, { ...products[0], id: 4, establishment: 'Outra Loja', minPrice: 27.9 }];
    const suggestions = suggestProducts(duplicated, 'arroz tio');
    expect(suggestions.filter(p => p.name === 'Arroz Tio João Tipo 1')).toHaveLength(1);
    expect(suggestions[0].minPrice).toBe(27.9);
  });
});

describe('Produtos similares', () => {
  const base = {
    slug: '', category: 'Mercearia', size: '1 kg', unit: 'pacote',
    minPrice: 1, avgPrice: 2, maxPrice: 3, storeCount: 1,
    establishmentId: 1, establishmentSlug: 'loja', establishment: 'Loja',
    neighborhood: 'Centro', storeColor: '#000', capturedAt: new Date().toISOString(),
  };
  const arroz = { ...base, id: 1, name: 'Arroz Tio João Tipo 1', brand: 'Tio João' };

  it('não trata produtos diferentes da mesma categoria como similares', () => {
    const catalog = [
      arroz,
      { ...base, id: 2, name: 'Feijão Carioca Kicaldo', brand: 'Kicaldo' },
      { ...base, id: 3, name: 'Óleo de Soja Liza', brand: 'Liza' },
    ];
    expect(findSimilarProducts(catalog, arroz)).toEqual([]);
  });

  it('encontra a mesma família de produto mesmo com outra marca', () => {
    const semelhante = { ...base, id: 2, name: 'Arroz Branco Bernardo', brand: 'Bernardo', minPrice: 6.5 };
    const catalog = [arroz, semelhante, { ...base, id: 3, name: 'Feijão Carioca', brand: 'Kicaldo' }];
    expect(findSimilarProducts(catalog, arroz).map(product => product.id)).toEqual([2]);
  });

  it('não cruza produtos com categorias incompatíveis', () => {
    const higiene = { ...base, id: 2, name: 'Óleo Corporal Amêndoas', brand: 'Marca', category: 'Higiene' };
    const cozinha = { ...base, id: 3, name: 'Óleo de Soja Liza', brand: 'Liza' };
    expect(findSimilarProducts([cozinha, higiene], cozinha)).toEqual([]);
  });

  it('remove cadastros duplicados do mesmo produto', () => {
    const duplicado = { ...arroz, id: 2, minPrice: .9 };
    expect(findSimilarProducts([arroz, duplicado], arroz)).toEqual([]);
  });
});

describe('Lógica de Filtro', () => {
  const products = [
    { name: 'Arroz Tio João', barcode: '123456789' },
    { name: 'Feijão Kicaldo', barcode: '987654321' },
    { name: 'Maçã Argentina', barcode: '11223344' }
  ];

  it('deve encontrar produto por nome parcial com acento', () => {
    const query = normalize('maca');
    const filtered = products.filter(p => normalize(p.name).includes(query));
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Maçã Argentina');
  });

  it('deve encontrar produto por barcode', () => {
    const query = '123456789';
    const filtered = products.filter(p => p.barcode === query || normalize(p.name).includes(normalize(query)));
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Arroz Tio João');
  });
});
