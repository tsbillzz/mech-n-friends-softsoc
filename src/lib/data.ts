export type PC = {
  id: string;
  status: 'available' | 'occupied' | 'broken' | 'under maintenance';
  position: { top: string; left: string };
  software: string[];
  clusterId?: number;
};

export type Floor = {
  id: string;
  name: string;
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
  'StarOffice',
  'NVivo',
  'EndNote',
  'Mathematica',
  'SAS',
  'Zoom',
];

const generatePcs = (count: number, prefix: string): PC[] => {
  const pcs: PC[] = [];
  let clusterCounter = 0;

  for (let i = 0; i < count; i++) {
    const software = availableSoftware.filter((_, index) => (i + index) % 4 !== 0);
    if (software.length === 0) {
      software.push('Microsoft Office');
    }

    const pc: PC = {
      id: `${prefix}-PC-${i + 1}`,
      status: i % 3 === 0 ? 'occupied' : 'available',
      position: {
        top: `${(i * 3) % 80 + 10}%`,
        left: `${(i * 7) % 90 + 5}%`,
      },
      software: software,
    };
    
    // Create some clusters
    if (i % 7 === 0 && i + 2 < count) {
      clusterCounter++;
      const clusterSize = 3;
      const baseTop = parseInt(pc.position.top);
      const baseLeft = parseInt(pc.position.left);
      
      for (let j = 0; j < clusterSize && i + j < count; j++) {
        pcs.push({
          ...pc,
          id: `${prefix}-PC-${i + 1 + j}`,
          clusterId: clusterCounter,
          position: {
            top: `${baseTop + j * 2}%`,
            left: `${baseLeft + j * 4}%`,
          },
        });
      }
      i += clusterSize - 1;
    } else {
      pcs.push(pc);
    }
  }
  return pcs;
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
        id: 'f-3',
        name: 'Floor 3',
        pcs: generatePcs(30, 'F1'),
      },
      {
        id: 'f-3-2',
        name: 'Floor 3',
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
        pcs: generatePcs(25, 'L1'),
      },
      {
        id: 'l-2',
        name: 'Level 2',
        pcs: generatePcs(35, 'L2'),
      },
    ],
  },
  {
    id: 'belinda-hutchinson',
    name: 'Belinda Hutchinson Building',
    position: { top: '10%', left: '15%' },
    dimensions: { width: '180px', height: '70px' },
    className: 'rounded-lg',
    floors: [
      {
        id: 'bh-1',
        name: 'Level 1',
        pcs: generatePcs(45, 'BH1'),
      },
    ],
  },
  {
    id: 'peter-nicol-russell',
    name: 'Peter Nicol Russell Building',
    position: { top: '45%', left: '10%' },
    dimensions: { width: '160px', height: '80px' },
    className: 'transform skew-y-6',
    floors: [
      {
        id: 'pnr-2',
        name: 'Level 2',
        pcs: generatePcs(60, 'PNR2'),
      },
    ],
  },
  {
    id: 'brennan-maccallum',
    name: 'Brennan MacCallum Building',
    position: { top: '70%', left: '25%' },
    dimensions: { width: '150px', height: '90px' },
    className: 'rounded-full',
    floors: [
      {
        id: 'bm-4',
        name: 'Level 4',
        pcs: generatePcs(30, 'BM4'),
      },
    ],
  },
];

export const allSoftware = availableSoftware;
export type BuildingData = typeof buildings;
