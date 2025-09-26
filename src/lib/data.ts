export type PC = {
  id: string;
  status: 'available' | 'occupied';
  position: { top: string; left: string };
  software: string[];
};

export type Floor = {
  id: string;
  name: string;
  mapImageId: string;
  pcs: PC[];
};

export type Building = {
  id: string;
  name: string;
  position: { top: string; left: string };
  floors: Floor[];
  dimensions?: { width: string; height: string };
  className?: string;
};

const availableSoftware = [
  'Adobe Photoshop',
  'AutoCAD',
  'MATLAB',
  'SPSS',
  'Microsoft Office',
  'Visual Studio Code',
  'R Studio',
  'Final Cut Pro',
];

const generatePcs = (count: number, prefix: string): PC[] => {
  return Array.from({ length: count }, (_, i) => {
    // Assign a random subset of software to each PC
    const software = availableSoftware.filter(() => Math.random() > 0.6);
    if (software.length === 0) {
      software.push('Microsoft Office'); // Ensure at least one software
    }

    return {
      id: `${prefix}-PC-${i + 1}`,
      status: Math.random() > 0.5 ? 'available' : 'occupied',
      position: {
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 90) + 5}%`,
      },
      software: software,
    };
  });
};

export const buildings: Building[] = [
  {
    id: 'fisher',
    name: 'Fisher Library',
    position: { top: '30%', left: '40%' },
    dimensions: { width: '150px', height: '100px' },
    className: 'transform -skew-x-12',
    floors: [
      {
        id: 'f-1',
        name: 'Floor 1',
        mapImageId: 'fisher-floor-1',
        pcs: generatePcs(30, 'F1'),
      },
      {
        id: 'f-3',
        name: 'Floor 3',
        mapImageId: 'fisher-floor-2',
        pcs: generatePcs(40, 'F3'),
      },
    ],
  },
  {
    id: 'scitech',
    name: 'SciTech Library',
    position: { top: '65%', left: '60%' },
    dimensions: { width: '120px', height: '80px' },
    floors: [
      {
        id: 's-3',
        name: 'Level 3',
        mapImageId: 'scitech-floor-3',
        pcs: generatePcs(50, 'S3'),
      },
    ],
  },
  {
    id: 'law',
    name: 'Law Library',
    position: { top: '15%', left: '65%' },
    dimensions: { width: '130px', height: '90px' },
    className: 'rounded-xl',
    floors: [
      {
        id: 'l-1',
        name: 'Level 1',
        mapImageId: 'law-floor-1',
        pcs: generatePcs(25, 'L1'),
      },
      {
        id: 'l-2',
        name: 'Level 2',
        mapImageId: 'law-floor-2',
        pcs: generatePcs(35, 'L2'),
      },
    ],
  },
];

export const allSoftware = availableSoftware;
export type BuildingData = typeof buildings;
