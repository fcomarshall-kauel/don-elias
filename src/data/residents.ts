// Base de datos local de residentes — extraída del libro de conserjería
// Estructura: { [departamento]: string[] } — cada string es un residente autorizado
//
// Teléfonos de prueba:
//   Deptos pares  → +56 9 8503 6056
//   Deptos impares → +56 9 9238 2509

export interface Resident {
  name: string;
  apt: string;
  tower: string;
}

const PHONE_EVEN = '56985036056';
const PHONE_ODD = '56992382509';

const residentsMap: Record<string, { tower: string; residents: string[]; phones?: string[] }> = {
  // ——— Torre Sur (pisos 2–12) ———
  '201': { tower: 'Torre Sur', residents: ['Maria E. Oirvan', 'Familia Oirvan'], phones: [PHONE_ODD] },
  '202': { tower: 'Torre Sur', residents: ['Yoy Pineda', 'Antonieta', 'Juan Pablo'], phones: [PHONE_EVEN] },
  '203': { tower: 'Torre Sur', residents: ['Andrea Bignon', 'Raul de Ramon', 'Amanda Miquele'], phones: [PHONE_ODD] },
  '301': { tower: 'Torre Sur', residents: ['Camila Parada', 'Matias Bosshard', 'Maria Jesus'], phones: [PHONE_ODD] },
  '302': { tower: 'Torre Sur', residents: ['Sergio Barriga', 'Emilia Shneberger'], phones: [PHONE_EVEN] },
  '303': { tower: 'Torre Sur', residents: ['Cristobal Arias', 'Gabriela Sanchez', 'Santiago'], phones: [PHONE_ODD] },
  '401': { tower: 'Torre Sur', residents: ['Alfredo Peña', 'Martita Villegas'], phones: [PHONE_ODD] },
  '402': { tower: 'Torre Sur', residents: ['Constanza Morales'], phones: [PHONE_EVEN] },
  '403': { tower: 'Torre Sur', residents: ['Aracely Lacroix'], phones: [PHONE_ODD] },
  '501': { tower: 'Torre Sur', residents: ['Patricia Rojas'], phones: [PHONE_ODD] },
  '502': { tower: 'Torre Sur', residents: ['Francisca Forch', 'Rodrigo Valenzuela'], phones: [PHONE_EVEN] },
  '503': { tower: 'Torre Sur', residents: ['Ines Fuentes Alba', 'Luciano'], phones: [PHONE_ODD] },
  '601': { tower: 'Torre Sur', residents: ['Adriana Davis', 'Fernanda Cañas'], phones: [PHONE_ODD] },
  '602': { tower: 'Torre Sur', residents: ['Jorge Pereira'], phones: [PHONE_EVEN] },
  '603': { tower: 'Torre Sur', residents: ['Javiera Sarmiento', 'Ignacio Sarmientos'], phones: [PHONE_ODD] },
  '701': { tower: 'Torre Sur', residents: ['Hector Serrat', 'Maria Elena Arias', 'Rocio'], phones: [PHONE_ODD] },
  '702': { tower: 'Torre Sur', residents: ['Gypsy Pizarro', 'Danilo Diaz', 'Valentina'], phones: [PHONE_EVEN] },
  '703': { tower: 'Torre Sur', residents: ['Paula Vargas', 'Simon Suarez'], phones: [PHONE_ODD] },
  '801': { tower: 'Torre Sur', residents: ['Raul Sanchez', 'Sara Vivero'], phones: [PHONE_ODD] },
  '802': { tower: 'Torre Sur', residents: ['Margarita Espejo', 'Romina Pietrantoni'], phones: [PHONE_EVEN] },
  '803': { tower: 'Torre Sur', residents: ['Colombo', 'Domenica Consignani'], phones: [PHONE_ODD] },
  '901': { tower: 'Torre Sur', residents: ['Claudio Bravo', 'Carmen Gloria Tobar'], phones: [PHONE_ODD] },
  '902': { tower: 'Torre Sur', residents: ['Patricia Sotomayor', 'Jaime Salinas'], phones: [PHONE_EVEN] },
  '903': { tower: 'Torre Sur', residents: ['Virgilio Perelta', 'Camila Riderell'], phones: [PHONE_ODD] },
  '1001': { tower: 'Torre Sur', residents: ['Rosario Perez', 'Juan Eduardo Baeza'], phones: [PHONE_ODD] },
  '1002': { tower: 'Torre Sur', residents: ['Joaquin Saavedra', 'Antonia Saavedra'], phones: [PHONE_EVEN] },
  '1003': { tower: 'Torre Sur', residents: ['Christian Arreaga', 'Teresa de la Torre'], phones: [PHONE_ODD] },
  '1101': { tower: 'Torre Sur', residents: ['Carolina Torres', 'Trinidad', 'Eddo Becerra'], phones: [PHONE_ODD] },
  '1102': { tower: 'Torre Sur', residents: ['Gonzalo Yeluz'], phones: [PHONE_EVEN] },
  '1103': { tower: 'Torre Sur', residents: ['Jaime Pelayo', 'Maria Isabel Rodriguez'], phones: [PHONE_ODD] },
  '1201': { tower: 'Torre Sur', residents: ['Paulina Pelayo', 'Rodolfo Leiva', 'Roque'], phones: [PHONE_ODD] },
  '1202': { tower: 'Torre Sur', residents: ['Rebecca Gerszenfer', 'Rony'], phones: [PHONE_EVEN] },
  '1203': { tower: 'Torre Sur', residents: ['Fernando Marlesa'], phones: [PHONE_ODD] },

  // ——— Torre Norte (pisos 13–23) ———
  '1301': { tower: 'Torre Norte', residents: ['Loreto Vera', 'Jorge Aldunate'], phones: [PHONE_ODD] },
  '1302': { tower: 'Torre Norte', residents: ['Mario Pinto Astudillo', 'Claudia Mendez'], phones: [PHONE_EVEN] },
  '1303': { tower: 'Torre Norte', residents: ['Montserrat Araya', 'Martina Celedon', 'Consuelo'], phones: [PHONE_ODD] },
  '1401': { tower: 'Torre Norte', residents: ['Andres Torres'], phones: [PHONE_ODD] },
  '1402': { tower: 'Torre Norte', residents: ['Viviana Jorquera', 'Humberto Leiva', 'Emma'], phones: [PHONE_EVEN] },
  '1403': { tower: 'Torre Norte', residents: ['Maximiliano Jara', 'Catalina Cruz'], phones: [PHONE_ODD] },
  '1501': { tower: 'Torre Norte', residents: ['Felipe Giacamann', 'Antonieta Dable'], phones: [PHONE_ODD] },
  '1502': { tower: 'Torre Norte', residents: ['Felipe Giacamann', 'Antonieta Dable'], phones: [PHONE_EVEN] },
  '1503': { tower: 'Torre Norte', residents: ['Constanza Morales', 'Pierpaolo Bolezzi', 'Franco'], phones: [PHONE_ODD] },
  '1601': { tower: 'Torre Norte', residents: ['Ines Fuentes Alba', 'Luciano'], phones: [PHONE_ODD] },
  '1602': { tower: 'Torre Norte', residents: ['Jhonna Vandorff', 'Paula Escobar', 'Trinidad', 'Belen'], phones: [PHONE_EVEN] },
  '1603': { tower: 'Torre Norte', residents: ['Pedro Torres', 'Fernanda Robalino', 'Isabel Ramirez'], phones: [PHONE_ODD] },
  '1701': { tower: 'Torre Norte', residents: ['Ricardo Cacho', 'Ivette Salinas', 'Tomas Morales'], phones: [PHONE_ODD] },
  '1702': { tower: 'Torre Norte', residents: ['Pedro Cueto', 'Daniela Soto', 'Fernanda Paris', 'Mateo Cueto'], phones: [PHONE_EVEN] },
  '1703': { tower: 'Torre Norte', residents: ['Pablo Galindo'], phones: [PHONE_ODD] },
  '1801': { tower: 'Torre Norte', residents: ['Angela Rivera', 'Matias'], phones: [PHONE_ODD] },
  '1802': { tower: 'Torre Norte', residents: ['Elena Castillo', 'Emilia', 'Nicolas'], phones: [PHONE_EVEN] },
  '1803': { tower: 'Torre Norte', residents: ['Jose Miguel Sarmiento', 'Giselle Milla'], phones: [PHONE_ODD] },
  '1901': { tower: 'Torre Norte', residents: ['Marta Moreno', 'Jessica Gutierrez', 'Emilia', 'Nicolas'], phones: [PHONE_ODD] },
  '1902': { tower: 'Torre Norte', residents: ['Gonzalo', 'Jose Luis Ordoñes'], phones: [PHONE_EVEN] },
  '1903': { tower: 'Torre Norte', residents: ['Carlos Llufi Reyes'], phones: [PHONE_ODD] },
  '2001': { tower: 'Torre Norte', residents: ['Nicolas Flores'], phones: [PHONE_ODD] },
  '2002': { tower: 'Torre Norte', residents: ['Cecilia Zulic', 'Sofia', 'Magdalena'], phones: [PHONE_EVEN] },
  '2003': { tower: 'Torre Norte', residents: ['Adriana Segovia', 'Catherine Campos', 'Paula', 'Jose Tomas'], phones: [PHONE_ODD] },
  '2101': { tower: 'Torre Norte', residents: ['Patricio Goic'], phones: [PHONE_ODD] },
  '2102': { tower: 'Torre Norte', residents: ['Marco Parker Foster', 'Cristobal', 'Andrea'], phones: [PHONE_EVEN] },
  '2103': { tower: 'Torre Norte', residents: ['William Montes'], phones: [PHONE_ODD] },
  '2201': { tower: 'Torre Norte', residents: ['Mira Rosa'], phones: [PHONE_ODD] },
  '2202': { tower: 'Torre Norte', residents: ['Consuelo Cajas'], phones: [PHONE_EVEN] },
  '2301': { tower: 'Torre Norte', residents: ['Matias Olivo'], phones: [PHONE_ODD] },
  '2302': { tower: 'Torre Norte', residents: ['Fernando Marlesa'], phones: [PHONE_EVEN] },
};

/** Obtener residentes por departamento */
export function getResidentsByApt(apt: string): string[] {
  return residentsMap[apt]?.residents ?? [];
}

/** Obtener torre por departamento */
export function getTowerByApt(apt: string): string | null {
  return residentsMap[apt]?.tower ?? null;
}

/** Obtener todos los departamentos */
export function getAllApartments(): string[] {
  return Object.keys(residentsMap).sort((a, b) => Number(a) - Number(b));
}

/** Obtener teléfonos registrados por departamento */
export function getPhonesByApt(apt: string): string[] {
  return residentsMap[apt]?.phones ?? [];
}

/** Buscar departamento por teléfono (reverse lookup para webhook) */
export function getAptByPhone(phone: string): string | null {
  // Normalizar: quitar + y espacios
  const normalized = phone.replace(/[+\s]/g, '');
  for (const [apt, data] of Object.entries(residentsMap)) {
    if (data.phones?.includes(normalized)) return apt;
  }
  return null;
}

/** Buscar residentes por nombre (para búsqueda) */
export function searchResidents(query: string): Resident[] {
  const q = query.toLowerCase();
  const results: Resident[] = [];
  for (const [apt, data] of Object.entries(residentsMap)) {
    for (const name of data.residents) {
      if (name.toLowerCase().includes(q) || apt.includes(q)) {
        results.push({ name, apt, tower: data.tower });
      }
    }
  }
  return results;
}
