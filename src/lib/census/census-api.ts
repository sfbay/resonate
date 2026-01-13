/**
 * Census Bureau API Client
 *
 * Fetches American Community Survey (ACS) 5-year estimates from the
 * Census Bureau API. Data is available at the census tract level for
 * San Francisco County (FIPS: 06075).
 *
 * API Documentation: https://www.census.gov/data/developers/data-sets/acs-5year.html
 * API Key: https://api.census.gov/data/key_signup.html
 */

// ACS 5-year estimate variables we need
// Reference: https://api.census.gov/data/2022/acs/acs5/variables.html
export const ACS_VARIABLES = {
  // Population
  totalPopulation: 'B01003_001E',

  // Income
  medianHouseholdIncome: 'B19013_001E',
  medianFamilyIncome: 'B19113_001E',
  perCapitaIncome: 'B19301_001E',

  // Income distribution (households)
  incomeUnder10k: 'B19001_002E',
  income10kTo15k: 'B19001_003E',
  income15kTo20k: 'B19001_004E',
  income20kTo25k: 'B19001_005E',
  income25kTo30k: 'B19001_006E',
  income30kTo35k: 'B19001_007E',
  income35kTo40k: 'B19001_008E',
  income40kTo45k: 'B19001_009E',
  income45kTo50k: 'B19001_010E',
  income50kTo60k: 'B19001_011E',
  income60kTo75k: 'B19001_012E',
  income75kTo100k: 'B19001_013E',
  income100kTo125k: 'B19001_014E',
  income125kTo150k: 'B19001_015E',
  income150kTo200k: 'B19001_016E',
  income200kPlus: 'B19001_017E',
  totalHouseholdsIncome: 'B19001_001E',

  // Poverty
  povertyTotal: 'B17001_001E',
  povertyBelowTotal: 'B17001_002E',

  // Race/Ethnicity (B03002 - Hispanic or Latino Origin by Race)
  totalRace: 'B03002_001E',
  notHispanicWhite: 'B03002_003E',
  notHispanicBlack: 'B03002_004E',
  notHispanicNative: 'B03002_005E',
  notHispanicAsian: 'B03002_006E',
  notHispanicPacific: 'B03002_007E',
  notHispanicOther: 'B03002_008E',
  notHispanicMulti: 'B03002_009E',
  hispanicTotal: 'B03002_012E',

  // Language - Population 5+ years (B16001 - Language Spoken at Home)
  langTotal5Plus: 'B16001_001E',
  langEnglishOnly: 'B16001_002E',

  // Specific languages (B16001) - for map overlays
  langSpanishSpeakers: 'B16001_003E',      // Spanish speakers total
  langSpanishLEP: 'B16001_005E',           // Spanish, speak English less than very well
  langChineseSpeakers: 'B16001_006E',      // Chinese speakers total
  langChineseLEP: 'B16001_008E',           // Chinese LEP
  langVietnameseSpeakers: 'B16001_009E',   // Vietnamese speakers total
  langVietnameseLEP: 'B16001_011E',        // Vietnamese LEP
  langTagalogSpeakers: 'B16001_012E',      // Tagalog speakers total
  langTagalogLEP: 'B16001_014E',           // Tagalog LEP
  langKoreanSpeakers: 'B16001_015E',       // Korean speakers total
  langKoreanLEP: 'B16001_017E',            // Korean LEP
  langRussianSpeakers: 'B16001_018E',      // Russian speakers total
  langRussianLEP: 'B16001_020E',           // Russian LEP

  // Broader language categories (B16004 for backward compatibility)
  langOtherIndoEuro: 'B16004_023E',
  langAsianPacific: 'B16004_043E',
  langAsianPacificLEP: 'B16004_045E',
  langOther: 'B16004_063E',

  // Housing tenure
  tenureTotal: 'B25003_001E',
  ownerOccupied: 'B25003_002E',
  renterOccupied: 'B25003_003E',

  // Rent burden (B25070 - Gross Rent as Percentage of Household Income)
  rentBurdenTotal: 'B25070_001E',
  rentBurden30To35: 'B25070_007E',
  rentBurden35To40: 'B25070_008E',
  rentBurden40To50: 'B25070_009E',
  rentBurden50Plus: 'B25070_010E',

  // Median rent and home value
  medianRent: 'B25064_001E',
  medianHomeValue: 'B25077_001E',

  // Age distribution
  ageTotal: 'B01001_001E',
  maleUnder5: 'B01001_003E',
  male5To9: 'B01001_004E',
  male10To14: 'B01001_005E',
  male15To17: 'B01001_006E',
  male18To19: 'B01001_007E',
  male20: 'B01001_008E',
  male21: 'B01001_009E',
  male22To24: 'B01001_010E',
  male25To29: 'B01001_011E',
  male30To34: 'B01001_012E',
  male35To39: 'B01001_013E',
  male40To44: 'B01001_014E',
  male45To49: 'B01001_015E',
  male50To54: 'B01001_016E',
  male55To59: 'B01001_017E',
  male60To61: 'B01001_018E',
  male62To64: 'B01001_019E',
  male65To66: 'B01001_020E',
  male67To69: 'B01001_021E',
  male70To74: 'B01001_022E',
  male75To79: 'B01001_023E',
  male80To84: 'B01001_024E',
  male85Plus: 'B01001_025E',
  femaleUnder5: 'B01001_027E',
  female5To9: 'B01001_028E',
  female10To14: 'B01001_029E',
  female15To17: 'B01001_030E',
  female18To19: 'B01001_031E',
  female20: 'B01001_032E',
  female21: 'B01001_033E',
  female22To24: 'B01001_034E',
  female25To29: 'B01001_035E',
  female30To34: 'B01001_036E',
  female35To39: 'B01001_037E',
  female40To44: 'B01001_038E',
  female45To49: 'B01001_039E',
  female50To54: 'B01001_040E',
  female55To59: 'B01001_041E',
  female60To61: 'B01001_042E',
  female62To64: 'B01001_043E',
  female65To66: 'B01001_044E',
  female67To69: 'B01001_045E',
  female70To74: 'B01001_046E',
  female75To79: 'B01001_047E',
  female80To84: 'B01001_048E',
  female85Plus: 'B01001_049E',

  // Education (25+ population)
  eduTotal: 'B15003_001E',
  eduNoSchool: 'B15003_002E',
  eduNursery: 'B15003_003E',
  eduKindergarten: 'B15003_004E',
  edu1st: 'B15003_005E',
  edu2nd: 'B15003_006E',
  edu3rd: 'B15003_007E',
  edu4th: 'B15003_008E',
  edu5th: 'B15003_009E',
  edu6th: 'B15003_010E',
  edu7th: 'B15003_011E',
  edu8th: 'B15003_012E',
  edu9th: 'B15003_013E',
  edu10th: 'B15003_014E',
  edu11th: 'B15003_015E',
  edu12thNoDiploma: 'B15003_016E',
  eduHighSchool: 'B15003_017E',
  eduGED: 'B15003_018E',
  eduSomeCollege1yr: 'B15003_019E',
  eduSomeCollegeMore: 'B15003_020E',
  eduAssociates: 'B15003_021E',
  eduBachelors: 'B15003_022E',
  eduMasters: 'B15003_023E',
  eduProfessional: 'B15003_024E',
  eduDoctorate: 'B15003_025E',

  // Foreign born
  nativeTotal: 'B05002_001E',
  foreignBorn: 'B05002_013E',

  // Household type
  householdTotal: 'B11001_001E',
  familyHouseholds: 'B11001_002E',
  marriedCouple: 'B11001_003E',
  nonFamilyHouseholds: 'B11001_007E',
  livingAlone: 'B11001_008E',
} as const;

// San Francisco County FIPS code
const SF_STATE_FIPS = '06';
const SF_COUNTY_FIPS = '075';

// API base URL
const CENSUS_API_BASE = 'https://api.census.gov/data';

export interface CensusApiConfig {
  apiKey?: string;
  year?: number;
  dataset?: 'acs5' | 'acs1';
}

/**
 * Get Census API key from environment or config
 */
function getApiKey(config: CensusApiConfig): string | undefined {
  return config.apiKey ?? process.env.CENSUS_API_KEY;
}

export interface TractData {
  tractId: string;
  state: string;
  county: string;
  tract: string;
  data: Record<string, number | null>;
}

/**
 * Fetch ACS data for all census tracts in San Francisco
 */
export async function fetchSFTractData(
  config: CensusApiConfig = {}
): Promise<TractData[]> {
  const { year = 2023, dataset = 'acs5' } = config;
  const apiKey = getApiKey(config);

  // Build variable list
  const variables = Object.values(ACS_VARIABLES).join(',');

  // Build API URL
  let url = `${CENSUS_API_BASE}/${year}/acs/${dataset}?get=NAME,${variables}&for=tract:*&in=state:${SF_STATE_FIPS}&in=county:${SF_COUNTY_FIPS}`;

  if (apiKey) {
    url += `&key=${apiKey}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status} ${response.statusText}`);
    }

    const data: string[][] = await response.json();

    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);

    // Find column indices
    const stateIdx = headers.indexOf('state');
    const countyIdx = headers.indexOf('county');
    const tractIdx = headers.indexOf('tract');

    // Map variable names to indices
    const variableIndices: Record<string, number> = {};
    for (const [name, code] of Object.entries(ACS_VARIABLES)) {
      const idx = headers.indexOf(code);
      if (idx !== -1) {
        variableIndices[name] = idx;
      }
    }

    // Parse rows into TractData
    return rows.map((row) => {
      const tractData: Record<string, number | null> = {};

      for (const [name, idx] of Object.entries(variableIndices)) {
        const value = row[idx];
        tractData[name] = value && value !== '-' ? parseFloat(value) : null;
      }

      return {
        tractId: `${row[stateIdx]}${row[countyIdx]}${row[tractIdx]}`,
        state: row[stateIdx],
        county: row[countyIdx],
        tract: row[tractIdx],
        data: tractData,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Census data:', error);
    throw error;
  }
}

/**
 * Calculate derived statistics from raw tract data
 */
export function calculateDerivedStats(data: Record<string, number | null>) {
  const safeDiv = (num: number | null, denom: number | null): number | null => {
    if (num === null || denom === null || denom === 0) return null;
    return (num / denom) * 100;
  };

  const safeSum = (...values: (number | null)[]): number | null => {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) : null;
  };

  return {
    // Poverty rate
    povertyRate: safeDiv(data.povertyBelowTotal, data.povertyTotal),

    // Race/ethnicity percentages
    whitePercent: safeDiv(data.notHispanicWhite, data.totalRace),
    blackPercent: safeDiv(data.notHispanicBlack, data.totalRace),
    asianPercent: safeDiv(data.notHispanicAsian, data.totalRace),
    hispanicPercent: safeDiv(data.hispanicTotal, data.totalRace),
    nativePercent: safeDiv(data.notHispanicNative, data.totalRace),
    pacificPercent: safeDiv(data.notHispanicPacific, data.totalRace),
    multiracialPercent: safeDiv(data.notHispanicMulti, data.totalRace),

    // Housing
    ownerPercent: safeDiv(data.ownerOccupied, data.tenureTotal),
    renterPercent: safeDiv(data.renterOccupied, data.tenureTotal),

    // Rent burden (30%+ of income)
    rentBurdenedPercent: safeDiv(
      safeSum(data.rentBurden30To35, data.rentBurden35To40, data.rentBurden40To50, data.rentBurden50Plus),
      data.rentBurdenTotal
    ),

    // Language - overall
    englishOnlyPercent: safeDiv(data.langEnglishOnly, data.langTotal5Plus),
    lepPercent: safeDiv(
      safeSum(data.langSpanishLEP, data.langChineseLEP, data.langVietnameseLEP, data.langTagalogLEP, data.langKoreanLEP, data.langRussianLEP),
      data.langTotal5Plus
    ),

    // Specific languages (percentage of population 5+)
    spanishPercent: safeDiv(data.langSpanishSpeakers, data.langTotal5Plus),
    chinesePercent: safeDiv(data.langChineseSpeakers, data.langTotal5Plus),
    vietnamesePercent: safeDiv(data.langVietnameseSpeakers, data.langTotal5Plus),
    tagalogPercent: safeDiv(data.langTagalogSpeakers, data.langTotal5Plus),
    koreanPercent: safeDiv(data.langKoreanSpeakers, data.langTotal5Plus),
    russianPercent: safeDiv(data.langRussianSpeakers, data.langTotal5Plus),

    // Foreign born
    foreignBornPercent: safeDiv(data.foreignBorn, data.nativeTotal),

    // Income distribution
    incomeUnder25k: safeDiv(
      safeSum(data.incomeUnder10k, data.income10kTo15k, data.income15kTo20k, data.income20kTo25k),
      data.totalHouseholdsIncome
    ),
    income25kTo50k: safeDiv(
      safeSum(data.income25kTo30k, data.income30kTo35k, data.income35kTo40k, data.income40kTo45k, data.income45kTo50k),
      data.totalHouseholdsIncome
    ),
    income50kTo75k: safeDiv(
      safeSum(data.income50kTo60k, data.income60kTo75k),
      data.totalHouseholdsIncome
    ),
    income75kTo100k: safeDiv(data.income75kTo100k, data.totalHouseholdsIncome),
    income100kTo150k: safeDiv(
      safeSum(data.income100kTo125k, data.income125kTo150k),
      data.totalHouseholdsIncome
    ),
    income150kPlus: safeDiv(
      safeSum(data.income150kTo200k, data.income200kPlus),
      data.totalHouseholdsIncome
    ),
  };
}

/**
 * Get a list of all SF census tract IDs
 */
export async function getSFTractIds(config: CensusApiConfig = {}): Promise<string[]> {
  const { year = 2023, dataset = 'acs5' } = config;
  const apiKey = getApiKey(config);

  let url = `${CENSUS_API_BASE}/${year}/acs/${dataset}?get=NAME&for=tract:*&in=state:${SF_STATE_FIPS}&in=county:${SF_COUNTY_FIPS}`;

  if (apiKey) {
    url += `&key=${apiKey}`;
  }

  const response = await fetch(url);
  const data: string[][] = await response.json();

  // Skip header row
  return data.slice(1).map((row) => {
    const state = row[row.length - 3];
    const county = row[row.length - 2];
    const tract = row[row.length - 1];
    return `${state}${county}${tract}`;
  });
}
