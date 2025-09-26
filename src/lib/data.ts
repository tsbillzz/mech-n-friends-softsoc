export type PC = {
  id: string;
  status: 'available' | 'occupied';
  position: { top: string; left: string };
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

const generatePcs = (count: number, prefix: string): PC[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-PC-${i + 1}`,
    status: Math.random() > 0.5 ? 'available' : 'occupied',
    position: {
      top: `${Math.floor(Math.random() * 80) + 10}%`,
      left: `${Math.floor(Math.random() * 90) + 5}%`,
    },
  }));
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
        id: 'f-2',
        name: 'Floor 2',
        mapImageId: 'fisher-floor-2',
        pcs: generatePcs(40, 'F2'),
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
        name: 'Floor 3',
        mapImageId: 'scitech-floor-3',
        pcs: generatePcs(50, 'S3'),
      },
    ],
  },
];

export type BuildingData = typeof buildings;
