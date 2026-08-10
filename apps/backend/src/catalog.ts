import { createSeededRandom } from "./utils/generatePriceSeries.js";

export type TokenDefinition = {
  id: string;
  name: string;
  symbol: string;
  subnet: string;
  basePrice: number;
  circulatingSupply: number;
  maxSupply: number;
  seed: number;
};

// Featured tokens mirror the Explore Tokens table in the design file.
const FEATURED_TOKENS: Omit<TokenDefinition, "seed">[] = [
  { id: "root", name: "Root", symbol: "ROOT", subnet: "SN0", basePrice: 245.12, circulatingSupply: 2_040_000, maxSupply: 21_000_000 },
  { id: "chutes", name: "Chutes", symbol: "CHUTE", subnet: "SN64", basePrice: 92.41, circulatingSupply: 4_870_000, maxSupply: 21_000_000 },
  { id: "ilum", name: "Ilum.io", symbol: "ILUM", subnet: "SN51", basePrice: 41.87, circulatingSupply: 8_370_000, maxSupply: 21_000_000 },
  { id: "targon", name: "Targon", symbol: "TARG", subnet: "SN4", basePrice: 28.93, circulatingSupply: 9_820_000, maxSupply: 21_000_000 },
  { id: "affine", name: "Affine", symbol: "AFF", subnet: "SN120", basePrice: 18.44, circulatingSupply: 11_940_000, maxSupply: 21_000_000 },
  { id: "score", name: "Score", symbol: "SCORE", subnet: "SN44", basePrice: 12.6, circulatingSupply: 16_670_000, maxSupply: 21_000_000 },
  { id: "iota", name: "iota", symbol: "IOTA", subnet: "SN9", basePrice: 6.82, circulatingSupply: 11_060_000, maxSupply: 21_000_000 },
  { id: "gradients", name: "Gradients", symbol: "GRAD", subnet: "SN56", basePrice: 5.67, circulatingSupply: 1_620_000, maxSupply: 21_000_000 },
  { id: "engy", name: "engy", symbol: "ENGY", subnet: "SN53", basePrice: 1.47, circulatingSupply: 11_030_000, maxSupply: 21_000_000 },
  { id: "vanta", name: "Vanta", symbol: "VANTA", subnet: "SN8", basePrice: 0.12, circulatingSupply: 10_250_000, maxSupply: 21_000_000 }
];

const NAME_PREFIXES = [
  "Nova", "Quanta", "Helix", "Aster", "Lumen", "Cipher", "Vertex", "Orbit", "Praxis", "Zenith",
  "Kelvin", "Nimbus", "Pulse", "Raster", "Sable", "Tundra", "Umbra", "Vector", "Warden", "Xenon"
];

const NAME_SUFFIXES = [
  "Net", "Lab", "Mesh", "Core", "Flow", "Grid", "Node", "Forge", "Works", "Chain", "Link", "Base"
];

const FILLER_TOKEN_COUNT = 240;

function seedForId(id: string) {
  return [...id].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 2_147_483_647, 9_973);
}

function buildFillerTokens(): TokenDefinition[] {
  const random = createSeededRandom(48_271);
  const usedSubnets = new Set(FEATURED_TOKENS.map((token) => token.subnet));
  const tokens: TokenDefinition[] = [];
  let subnetNumber = 1;

  for (let index = 0; index < FILLER_TOKEN_COUNT; index += 1) {
    while (usedSubnets.has(`SN${subnetNumber}`)) subnetNumber += 1;
    const subnet = `SN${subnetNumber}`;
    usedSubnets.add(subnet);

    const prefix = NAME_PREFIXES[Math.floor(random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(random() * NAME_SUFFIXES.length)];
    const name = `${prefix}${suffix}`;
    const id = `${name.toLowerCase()}-${subnetNumber}`;

    const magnitude = random();
    const basePrice = Math.round((0.01 + magnitude ** 2.4 * 48) * 10_000) / 10_000;
    const circulatingSupply = Math.round(400_000 + random() * 18_000_000);

    tokens.push({
      id,
      name,
      symbol: `${prefix.slice(0, 3).toUpperCase()}${subnetNumber}`,
      subnet,
      basePrice,
      circulatingSupply,
      maxSupply: 21_000_000,
      seed: seedForId(id)
    });
  }

  return tokens;
}

const CATALOG: TokenDefinition[] = [
  ...FEATURED_TOKENS.map((token) => ({ ...token, seed: seedForId(token.id) })),
  ...buildFillerTokens()
];

const CATALOG_BY_ID = new Map(CATALOG.map((token) => [token.id, token]));

export function allTokens(): TokenDefinition[] {
  return CATALOG;
}

export function findToken(id: string): TokenDefinition | undefined {
  return CATALOG_BY_ID.get(id);
}
