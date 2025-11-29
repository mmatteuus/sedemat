export interface Department {
  id: string;
  name: string;
  path: string;
  defaultAccess: boolean;
  active: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'word' | 'excel' | 'image' | 'other';
  departmentId: string;
  parentId: string | null;
  modifiedDate: string;
  size?: string;
}

export const mockDepartments: Department[] = [
  {
    id: 'administrativo',
    name: 'ADMINISTRATIVO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\ADMINISTRATIVO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'desenvolvimento',
    name: 'DESENVOLVIMENTO ECONOMICO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\DESENVOLVIMENTO ECONOMICO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'fiscalizacao',
    name: 'FISCALIZAÇÃO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\FISCALIZACAO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'geral',
    name: 'GERAL MEIO AMBIENTE',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\GERAL MEIO AMBIENTE',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'juridico',
    name: 'JURIDICO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\JURIDICO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'licenciamento',
    name: 'LICENCIAMENTO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\LICENCIAMENTO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'turismo',
    name: 'TURISMO',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\TURISMO',
    defaultAccess: false,
    active: true,
  },
  {
    id: 'geral-sedemat',
    name: 'GERAL SEDEMAT',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\GERAL SEDEMAT',
    defaultAccess: true,
    active: true,
  },
  {
    id: 'scan',
    name: 'SCAN',
    path: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\SCAN',
    defaultAccess: true,
    active: true,
  },
];

export const mockFiles: FileItem[] = [
  // LICENCIAMENTO files
  { id: 'f1', name: '2025', type: 'folder', departmentId: 'licenciamento', parentId: null, modifiedDate: '2025-01-15' },
  { id: 'f2', name: 'Maio', type: 'folder', departmentId: 'licenciamento', parentId: 'f1', modifiedDate: '2025-05-01' },
  { id: 'f3', name: 'Relatório Ambiental.pdf', type: 'pdf', departmentId: 'licenciamento', parentId: 'f2', modifiedDate: '2025-05-10', size: '2.3 MB' },
  { id: 'f4', name: 'Análise de Impacto.docx', type: 'word', departmentId: 'licenciamento', parentId: 'f2', modifiedDate: '2025-05-12', size: '1.1 MB' },
  { id: 'f5', name: 'Fotos Vistoria.jpg', type: 'image', departmentId: 'licenciamento', parentId: 'f2', modifiedDate: '2025-05-08', size: '4.5 MB' },
  
  // JURIDICO files
  { id: 'j1', name: 'Processos', type: 'folder', departmentId: 'juridico', parentId: null, modifiedDate: '2025-01-10' },
  { id: 'j2', name: 'Processo 2025-001.pdf', type: 'pdf', departmentId: 'juridico', parentId: 'j1', modifiedDate: '2025-04-20', size: '3.2 MB' },
  { id: 'j3', name: 'Parecer Jurídico.docx', type: 'word', departmentId: 'juridico', parentId: 'j1', modifiedDate: '2025-04-22', size: '890 KB' },
  
  // GERAL SEDEMAT files
  { id: 'g1', name: 'Comunicados', type: 'folder', departmentId: 'geral-sedemat', parentId: null, modifiedDate: '2025-01-05' },
  { id: 'g2', name: 'Comunicado Interno 001.pdf', type: 'pdf', departmentId: 'geral-sedemat', parentId: 'g1', modifiedDate: '2025-05-01', size: '156 KB' },
  { id: 'g3', name: 'Calendário 2025.xlsx', type: 'excel', departmentId: 'geral-sedemat', parentId: 'g1', modifiedDate: '2025-01-15', size: '245 KB' },
];
