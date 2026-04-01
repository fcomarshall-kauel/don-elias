// Base de datos local de residentes — extraída del libro de conserjería
// Estructura: { [departamento]: string[] } — cada string es un residente autorizado

export interface Resident {
  name: string;
  apt: string;
  tower: string;
}

const residentsMap: Record<string, { tower: string; residents: string[] }> = {
  // ——— Torre Sur (pisos 2–12) ———
  '201': { tower: 'Torre Sur', residents: ['Maria E. Oirvan', 'Familia Oirvan'] },
  '202': { tower: 'Torre Sur', residents: ['Yoy Pineda', 'Antonieta', 'Juan Pablo'] },
  '203': { tower: 'Torre Sur', residents: ['Andrea Bignon', 'Raul de Ramon', 'Amanda Miquele'] },
  '301': { tower: 'Torre Sur', residents: ['Camila Parada', 'Matias Bosshard', 'Maria Jesus'] },
  '302': { tower: 'Torre Sur', residents: ['Sergio Barriga', 'Emilia Shneberger'] },
  '303': { tower: 'Torre Sur', residents: ['Cristobal Arias', 'Gabriela Sanchez', 'Santiago'] },
  '401': { tower: 'Torre Sur', residents: ['Alfredo Peña', 'Martita Villegas'] },
  '402': { tower: 'Torre Sur', residents: ['Constanza Morales'] },
  '403': { tower: 'Torre Sur', residents: ['Aracely Lacroix'] },
  '501': { tower: 'Torre Sur', residents: ['Patricia Rojas'] },
  '502': { tower: 'Torre Sur', residents: ['Francisca Forch', 'Rodrigo Valenzuela'] },
  '503': { tower: 'Torre Sur', residents: ['Ines Fuentes Alba', 'Luciano'] },
  '601': { tower: 'Torre Sur', residents: ['Adriana Davis', 'Fernanda Cañas'] },
  '602': { tower: 'Torre Sur', residents: ['Jorge Pereira'] },
  '603': { tower: 'Torre Sur', residents: ['Javiera Sarmiento', 'Ignacio Sarmientos'] },
  '701': { tower: 'Torre Sur', residents: ['Hector Serrat', 'Maria Elena Arias', 'Rocio'] },
  '702': { tower: 'Torre Sur', residents: ['Gypsy Pizarro', 'Danilo Diaz', 'Valentina'] },
  '703': { tower: 'Torre Sur', residents: ['Paula Vargas', 'Simon Suarez'] },
  '801': { tower: 'Torre Sur', residents: ['Raul Sanchez', 'Sara Vivero'] },
  '802': { tower: 'Torre Sur', residents: ['Margarita Espejo', 'Romina Pietrantoni'] },
  '803': { tower: 'Torre Sur', residents: ['Colombo', 'Domenica Consignani'] },
  '901': { tower: 'Torre Sur', residents: ['Claudio Bravo', 'Carmen Gloria Tobar'] },
  '902': { tower: 'Torre Sur', residents: ['Patricia Sotomayor', 'Jaime Salinas'] },
  '903': { tower: 'Torre Sur', residents: ['Virgilio Perelta', 'Camila Riderell'] },
  '1001': { tower: 'Torre Sur', residents: ['Rosario Perez', 'Juan Eduardo Baeza'] },
  '1002': { tower: 'Torre Sur', residents: ['Joaquin Saavedra', 'Antonia Saavedra'] },
  '1003': { tower: 'Torre Sur', residents: ['Christian Arreaga', 'Teresa de la Torre'] },
  '1101': { tower: 'Torre Sur', residents: ['Carolina Torres', 'Trinidad', 'Eddo Becerra'] },
  '1102': { tower: 'Torre Sur', residents: ['Gonzalo Yeluz'] },
  '1103': { tower: 'Torre Sur', residents: ['Jaime Pelayo', 'Maria Isabel Rodriguez'] },
  '1201': { tower: 'Torre Sur', residents: ['Paulina Pelayo', 'Rodolfo Leiva', 'Roque'] },
  '1202': { tower: 'Torre Sur', residents: ['Rebecca Gerszenfer', 'Rony'] },
  '1203': { tower: 'Torre Sur', residents: ['Fernando Marlesa'] },

  // ——— Torre Norte (pisos 13–23) ———
  '1301': { tower: 'Torre Norte', residents: ['Loreto Vera', 'Jorge Aldunate'] },
  '1302': { tower: 'Torre Norte', residents: ['Mario Pinto Astudillo', 'Claudia Mendez'] },
  '1303': { tower: 'Torre Norte', residents: ['Montserrat Araya', 'Martina Celedon', 'Consuelo'] },
  '1401': { tower: 'Torre Norte', residents: ['Andres Torres'] },
  '1402': { tower: 'Torre Norte', residents: ['Viviana Jorquera', 'Humberto Leiva', 'Emma'] },
  '1403': { tower: 'Torre Norte', residents: ['Maximiliano Jara', 'Catalina Cruz'] },
  '1501': { tower: 'Torre Norte', residents: ['Felipe Giacamann', 'Antonieta Dable'] },
  '1502': { tower: 'Torre Norte', residents: ['Felipe Giacamann', 'Antonieta Dable'] },
  '1503': { tower: 'Torre Norte', residents: ['Constanza Morales', 'Pierpaolo Bolezzi', 'Franco'] },
  '1601': { tower: 'Torre Norte', residents: ['Ines Fuentes Alba', 'Luciano'] },
  '1602': { tower: 'Torre Norte', residents: ['Jhonna Vandorff', 'Paula Escobar', 'Trinidad', 'Belen'] },
  '1603': { tower: 'Torre Norte', residents: ['Pedro Torres', 'Fernanda Robalino', 'Isabel Ramirez'] },
  '1701': { tower: 'Torre Norte', residents: ['Ricardo Cacho', 'Ivette Salinas', 'Tomas Morales'] },
  '1702': { tower: 'Torre Norte', residents: ['Pedro Cueto', 'Daniela Soto', 'Fernanda Paris', 'Mateo Cueto'] },
  '1703': { tower: 'Torre Norte', residents: ['Pablo Galindo'] },
  '1801': { tower: 'Torre Norte', residents: ['Angela Rivera', 'Matias'] },
  '1802': { tower: 'Torre Norte', residents: ['Elena Castillo', 'Emilia', 'Nicolas'] },
  '1803': { tower: 'Torre Norte', residents: ['Jose Miguel Sarmiento', 'Giselle Milla'] },
  '1901': { tower: 'Torre Norte', residents: ['Marta Moreno', 'Jessica Gutierrez', 'Emilia', 'Nicolas'] },
  '1902': { tower: 'Torre Norte', residents: ['Gonzalo', 'Jose Luis Ordoñes'] },
  '1903': { tower: 'Torre Norte', residents: ['Carlos Llufi Reyes'] },
  '2001': { tower: 'Torre Norte', residents: ['Nicolas Flores'] },
  '2002': { tower: 'Torre Norte', residents: ['Cecilia Zulic', 'Sofia', 'Magdalena'] },
  '2003': { tower: 'Torre Norte', residents: ['Adriana Segovia', 'Catherine Campos', 'Paula', 'Jose Tomas'] },
  '2101': { tower: 'Torre Norte', residents: ['Patricio Goic'] },
  '2102': { tower: 'Torre Norte', residents: ['Marco Parker Foster', 'Cristobal', 'Andrea'] },
  '2103': { tower: 'Torre Norte', residents: ['William Montes'] },
  '2201': { tower: 'Torre Norte', residents: ['Mira Rosa'] },
  '2202': { tower: 'Torre Norte', residents: ['Consuelo Cajas'] },
  '2301': { tower: 'Torre Norte', residents: ['Matias Olivo'] },
  '2302': { tower: 'Torre Norte', residents: ['Fernando Marlesa'] },
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
