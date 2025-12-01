import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DepartmentCard from '@/components/DepartmentCard';
import FileList from '@/components/FileList';
import FilePreview from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { Folder, LogOut, Settings } from 'lucide-react';
import { api } from '@/lib/api';
import { Department, FileItem, FilePreviewData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<{ label: string; path: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewData, setPreviewData] = useState<FilePreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    api
      .listDepartments()
      .then((data) => setDepartments(data))
      .catch(() =>
        toast({
          title: 'Erro ao carregar departamentos',
          description: 'Confirme se o compartilhamento de rede esta acessivel',
          variant: 'destructive',
        }),
      );
  }, [toast]);

  const visibleDepartments = useMemo(() => {
    if (!user) return [];
    if (user.role === 'GESTOR_TI') return departments.filter((d) => d.active);
    return departments.filter(
      (dept) => dept.active && (dept.defaultAccess || user.departments.includes(dept.id)),
    );
  }, [departments, user]);

  const buildBreadcrumb = (dept: Department, path: string) => {
    const parts = path ? path.split(/\\|\//).filter(Boolean) : [];
    const items = [{ label: dept.name, path: '' }];
    let accumulator = '';
    parts.forEach((part) => {
      accumulator = accumulator ? `${accumulator}\\${part}` : part;
      items.push({ label: part, path: accumulator });
    });
    return items;
  };

  const loadFiles = async (deptId: string, path: string) => {
    setLoadingFiles(true);
    try {
      const list = await api.listFiles({ departmentId: deptId, relativePath: path });
      setFiles(list);
    } catch (error) {
      toast({
        title: 'Erro ao listar arquivos',
        description: 'Verifique o acesso ao compartilhamento e as permissoes do usuario',
        variant: 'destructive',
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setCurrentPath('');
    const breadcrumbItems = buildBreadcrumb(dept, '');
    setBreadcrumb(breadcrumbItems);
    loadFiles(dept.id, '');
  };

  const handleFolderClick = (folder: FileItem) => {
    if (!selectedDepartment) return;
    const nextPath = currentPath ? `${currentPath}\\${folder.name}` : folder.name;
    setCurrentPath(nextPath);
    setBreadcrumb(buildBreadcrumb(selectedDepartment, nextPath));
    loadFiles(selectedDepartment.id, nextPath);
  };

  const handleBreadcrumbClick = (path: string) => {
    if (!selectedDepartment) return;
    setCurrentPath(path);
    setBreadcrumb(buildBreadcrumb(selectedDepartment, path));
    loadFiles(selectedDepartment.id, path);
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setCurrentPath('');
    setBreadcrumb([]);
    setFiles([]);
  };

  const handleFileClick = async (file: FileItem) => {
    setSelectedFile(file);
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const preview = await api.previewFile({ fullPath: file.fullPath, type: file.type });
      setPreviewData(preview);
    } catch (error) {
      setPreviewData({ mode: 'unsupported', message: 'Nao foi possivel carregar o preview' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenFile = async () => {
    if (!selectedFile) return;
    await api.openFile({ fullPath: selectedFile.fullPath });
  };

  const handleDownloadFile = async () => {
    if (!selectedFile) return;
    const savedPath = await api.downloadFile({ fullPath: selectedFile.fullPath });
    if (savedPath) {
      toast({
        title: 'Arquivo copiado',
        description: `Salvo em ${savedPath}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Pastas SEDEMAT</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">Ola, {user?.name}</p>
              <p className="text-sm opacity-90">
                {user?.role === 'GESTOR_TI' ? 'Gestor TI' : 'Servidor'}
              </p>
            </div>
            {user?.role === 'GESTOR_TI' && (
              <Button variant="secondary" size="icon" onClick={() => navigate('/admin')}>
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button variant="secondary" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedDepartment ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Meus Departamentos</h2>
            {visibleDepartments.length === 0 ? (
              <div className="p-6 border rounded-lg text-muted-foreground">
                Nenhum departamento liberado. Solicite acesso ao Gestor TI.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleDepartments.map((dept) => (
                  <DepartmentCard
                    key={dept.id}
                    department={dept}
                    onClick={() => handleDepartmentClick(dept)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" onClick={handleBack}>
              Voltar aos departamentos
            </Button>
            <FileList
              files={files}
              breadcrumb={breadcrumb}
              onBreadcrumbClick={handleBreadcrumbClick}
              onFileClick={handleFileClick}
              onFolderClick={handleFolderClick}
              loading={loadingFiles}
            />
          </div>
        )}
      </main>

      <FilePreview
        file={selectedFile}
        preview={previewData}
        loading={previewLoading}
        onClose={() => {
          setSelectedFile(null);
          setPreviewData(null);
        }}
        onOpen={handleOpenFile}
        onDownload={handleDownloadFile}
      />
    </div>
  );
};

export default Dashboard;
