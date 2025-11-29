import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockDepartments, mockFiles, FileItem, Department } from '@/data/mockData';
import DepartmentCard from '@/components/DepartmentCard';
import FileList from '@/components/FileList';
import FilePreview from '@/components/FilePreview';
import { Button } from '@/components/ui/button';
import { Folder, LogOut, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<FileItem[]>([]);

  const userDepartments = user?.role === 'GESTOR_TI'
    ? mockDepartments
    : mockDepartments.filter(
        (dept) => dept.defaultAccess || user?.departments.includes(dept.name)
      );

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setCurrentPath([{ id: dept.id, name: dept.name, type: 'folder' } as FileItem]);
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setCurrentPath([]);
  };

  const getCurrentFiles = () => {
    if (!selectedDepartment) return [];
    const currentFolderId = currentPath[currentPath.length - 1]?.id;
    return mockFiles.filter(
      (f) => f.departmentId === selectedDepartment.id && f.parentId === (currentFolderId === selectedDepartment.id ? null : currentFolderId)
    );
  };

  const handleFolderClick = (folder: FileItem) => {
    setCurrentPath([...currentPath, folder]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Pastas SEDEMAT</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">Olá, {user?.name}</p>
              <p className="text-sm opacity-90">
                {user?.role === 'GESTOR_TI' ? 'Gestor TI' : 'Servidor'}
              </p>
            </div>
            {user?.role === 'GESTOR_TI' && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigate('/admin')}
              >
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userDepartments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onClick={() => handleDepartmentClick(dept)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" onClick={handleBack}>
              ← Voltar aos Departamentos
            </Button>
            <FileList
              files={getCurrentFiles()}
              onFileClick={setSelectedFile}
              onFolderClick={handleFolderClick}
              breadcrumb={currentPath}
            />
          </div>
        )}
      </main>

      <FilePreview file={selectedFile} onClose={() => setSelectedFile(null)} />
    </div>
  );
};

export default Dashboard;
