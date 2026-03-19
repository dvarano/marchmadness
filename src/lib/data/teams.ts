import type { Team } from '@/types'

// 2026 NCAA Tournament — 64-team bracket
// Seeds: 1.5 in source data = #1 seed
export const TEAMS: Team[] = [
  // ── East Region ──────────────────────────────────────────────────────────
  { id: 'duke',          name: 'Duke',              seed: 1,  region: 'East', aliases: ['Blue Devils'] },
  { id: 'uconn',         name: 'UConn',             seed: 2,  region: 'East', aliases: ['Connecticut', 'Huskies'] },
  { id: 'michigan-state',name: 'Michigan St.',      seed: 3,  region: 'East', aliases: ['Michigan State', 'MSU', 'Spartans'] },
  { id: 'kansas',        name: 'Kansas',            seed: 4,  region: 'East', aliases: ['Jayhawks', 'KU'] },
  { id: 'st-johns',      name: "St. John's",        seed: 5,  region: 'East', aliases: ['Saint Johns', 'Red Storm'] },
  { id: 'louisville',    name: 'Louisville',        seed: 6,  region: 'East', aliases: ['Cardinals', 'UofL'] },
  { id: 'ucla',          name: 'UCLA',              seed: 7,  region: 'East', aliases: ['Bruins'] },
  { id: 'ohio-state',    name: 'Ohio St.',          seed: 8,  region: 'East', aliases: ['Ohio State', 'Buckeyes', 'OSU'] },
  { id: 'tcu',           name: 'TCU',               seed: 9,  region: 'East', aliases: ['Texas Christian', 'Horned Frogs'] },
  { id: 'ucf',           name: 'UCF',               seed: 10, region: 'East', aliases: ['Central Florida'] },
  { id: 'south-florida', name: 'South Florida',     seed: 11, region: 'East', aliases: ['USF', 'Bulls'] },
  { id: 'northern-iowa', name: 'Northern Iowa',     seed: 12, region: 'East', aliases: ['Panthers', 'UNI'] },
  { id: 'cal-baptist',   name: 'California Baptist',seed: 13, region: 'East', aliases: ['CBU', 'Cal Baptist', 'Lancers'] },
  { id: 'north-dakota-st',name:'North Dakota St.',  seed: 14, region: 'East', aliases: ['NDSU', 'Bison'] },
  { id: 'furman',        name: 'Furman',            seed: 15, region: 'East', aliases: ['Paladins'] },
  { id: 'siena',         name: 'Siena',             seed: 16, region: 'East', aliases: ['Saints'] },

  // ── West Region ──────────────────────────────────────────────────────────
  { id: 'arizona',       name: 'Arizona',           seed: 1,  region: 'West', aliases: ['Wildcats', 'Zona'] },
  { id: 'purdue',        name: 'Purdue',            seed: 2,  region: 'West', aliases: ['Boilermakers'] },
  { id: 'gonzaga',       name: 'Gonzaga',           seed: 3,  region: 'West', aliases: ['Zags', 'Bulldogs'] },
  { id: 'arkansas',      name: 'Arkansas',          seed: 4,  region: 'West', aliases: ['Razorbacks', 'Hogs'] },
  { id: 'wisconsin',     name: 'Wisconsin',         seed: 5,  region: 'West', aliases: ['Badgers', 'Wisc'] },
  { id: 'byu',           name: 'BYU',               seed: 6,  region: 'West', aliases: ['Brigham Young', 'Cougars'] },
  { id: 'miami-fl',      name: 'U Miami (FL)',      seed: 7,  region: 'West', aliases: ['Miami', 'Hurricanes', 'UM'] },
  { id: 'villanova',     name: 'Villanova',         seed: 8,  region: 'West', aliases: ['Nova', 'Wildcats'] },
  { id: 'utah-state',    name: 'Utah St.',          seed: 9,  region: 'West', aliases: ['Utah State', 'Aggies', 'USU'] },
  { id: 'missouri',      name: 'Missouri',          seed: 10, region: 'West', aliases: ['Tigers', 'Mizzou'] },
  { id: 'texas',         name: 'Texas',             seed: 11, region: 'West', aliases: ['Longhorns', 'UT'] },
  { id: 'high-point',    name: 'High Point',        seed: 12, region: 'West', aliases: ['Panthers'] },
  { id: 'hawaii',        name: 'Hawaii',            seed: 13, region: 'West', aliases: ['Rainbow Warriors', 'Warriors'] },
  { id: 'kennesaw-state',name: 'Kennesaw St.',      seed: 14, region: 'West', aliases: ['Kennesaw State', 'Owls', 'KSU'] },
  { id: 'queens',        name: 'Queens',            seed: 15, region: 'West', aliases: ['Royals'] },
  { id: 'liu',           name: 'LIU',               seed: 16, region: 'West', aliases: ['Long Island', 'Sharks'] },

  // ── South Region ─────────────────────────────────────────────────────────
  { id: 'florida',       name: 'Florida',           seed: 1,  region: 'South', aliases: ['Gators', 'UF'] },
  { id: 'houston',       name: 'Houston',           seed: 2,  region: 'South', aliases: ['Cougars', 'UH'] },
  { id: 'illinois',      name: 'Illinois',          seed: 3,  region: 'South', aliases: ['Fighting Illini', 'Illini'] },
  { id: 'nebraska',      name: 'Nebraska',          seed: 4,  region: 'South', aliases: ['Cornhuskers', 'Huskers'] },
  { id: 'vanderbilt',    name: 'Vanderbilt',        seed: 5,  region: 'South', aliases: ['Vandy', 'Commodores'] },
  { id: 'north-carolina',name: 'North Carolina',    seed: 6,  region: 'South', aliases: ['UNC', 'Tar Heels', 'Carolina'] },
  { id: 'st-marys',      name: "Saint Mary's (CA)", seed: 7,  region: 'South', aliases: ["St. Mary's", 'Gaels', 'Saint Marys'] },
  { id: 'clemson',       name: 'Clemson',           seed: 8,  region: 'South', aliases: ['Tigers'] },
  { id: 'iowa',          name: 'Iowa',              seed: 9,  region: 'South', aliases: ['Hawkeyes'] },
  { id: 'texas-a&m',     name: 'Texas A&M',         seed: 10, region: 'South', aliases: ['Texas AM', 'Aggies', 'TAMU'] },
  { id: 'vcu',           name: 'VCU',               seed: 11, region: 'South', aliases: ['Virginia Commonwealth', 'Rams'] },
  { id: 'mcneese',       name: 'McNeese',           seed: 12, region: 'South', aliases: ['McNeese State', 'Cowboys'] },
  { id: 'troy',          name: 'Troy',              seed: 13, region: 'South', aliases: ['Trojans'] },
  { id: 'penn',          name: 'Penn',              seed: 14, region: 'South', aliases: ['Quakers', 'Pennsylvania'] },
  { id: 'idaho',         name: 'Idaho',             seed: 15, region: 'South', aliases: ['Vandals'] },
  { id: 'prairie-view',  name: 'Prairie View A&M',  seed: 16, region: 'South', aliases: ['PVAMU', 'Panthers'] },

  // ── Midwest Region ───────────────────────────────────────────────────────
  { id: 'michigan',      name: 'Michigan',          seed: 1,  region: 'Midwest', aliases: ['Wolverines'] },
  { id: 'iowa-state',    name: 'Iowa St.',          seed: 2,  region: 'Midwest', aliases: ['Iowa State', 'Cyclones', 'ISU'] },
  { id: 'virginia',      name: 'Virginia',          seed: 3,  region: 'Midwest', aliases: ['Cavaliers', 'UVA', 'Hoos'] },
  { id: 'alabama',       name: 'Alabama',           seed: 4,  region: 'Midwest', aliases: ['Crimson Tide'] },
  { id: 'texas-tech',    name: 'Texas Tech',        seed: 5,  region: 'Midwest', aliases: ['Red Raiders', 'TTU'] },
  { id: 'tennessee',     name: 'Tennessee',         seed: 6,  region: 'Midwest', aliases: ['Vols', 'Volunteers'] },
  { id: 'kentucky',      name: 'Kentucky',          seed: 7,  region: 'Midwest', aliases: ['Wildcats', 'UK', 'Cats'] },
  { id: 'georgia',       name: 'Georgia',           seed: 8,  region: 'Midwest', aliases: ['Bulldogs', 'Dawgs', 'UGA'] },
  { id: 'st-louis',      name: 'Saint Louis',       seed: 9,  region: 'Midwest', aliases: ['SLU', 'St. Louis', 'Billikens'] },
  { id: 'santa-clara',   name: 'Santa Clara',       seed: 10, region: 'Midwest', aliases: ['Broncos'] },
  { id: 'miami-oh',      name: 'Miami (OH)',         seed: 11, region: 'Midwest', aliases: ['Miami University', 'RedHawks', 'Miami Ohio'] },
  { id: 'akron',         name: 'Akron',             seed: 12, region: 'Midwest', aliases: ['Zips'] },
  { id: 'hofstra',       name: 'Hofstra',           seed: 13, region: 'Midwest', aliases: ['Pride'] },
  { id: 'wright-state',  name: 'Wright St.',        seed: 14, region: 'Midwest', aliases: ['Wright State', 'Raiders'] },
  { id: 'tennessee-state',name:'Tennessee St.',     seed: 15, region: 'Midwest', aliases: ['Tennessee State', 'Tigers', 'TSU'] },
  { id: 'howard',        name: 'Howard',            seed: 16, region: 'Midwest', aliases: ['Bison'] },
]

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find(t => t.id === id)
}

export function getTeamsByRegion(region: string): Team[] {
  return TEAMS.filter(t => t.region === region).sort((a, b) => a.seed - b.seed)
}
