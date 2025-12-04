import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import Header from "@/components/ui/Header";
import DepartmentCard from "@/components/departments/DepartmentCard";
import Breadcrumb from "@/components/files/Breadcrumb";
import FileList from "@/components/files/FileList";
import FileFilters from "@/components/files/FileFilters";
import FilePreview from "@/components/files/FilePreview";
import MultiFilePreview from "@/components/files/MultiFilePreview";
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Folder,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simulated file data - in real app this would come from backend
const generateMockFiles = (departmentName, path = []) => {
  const folders = ['2024', '2025', 'Documentos', 'Relatórios', 'Processos'];
  const files = [
    { name: 'Relatório_Mensal.pdf', extension: 'pdf', size: '2.4 MB', modifiedDate: '2025-01-10' },
    { name: 'Planilha_Controle.xlsx', extension: 'xlsx', size: '1.1 MB', modifiedDate: '2025-01-09' },
    { name: 'Ofício_001.docx', extension: 'docx', size: '340 KB', modifiedDate: '2025-01-08' },
    { name: 'Foto_Vistoria.jpg', extension: 'jpg', size: '4.2 MB', modifiedDate: '2025-01-07' },
    { name: 'Parecer_Técnico.pdf', extension: 'pdf', size: '890 KB', modifiedDate: '2025-01-06' },
  ];

  if (path.length === 0) {
    return folders.map(f => ({
      name: f,
      isFolder: true,
      path: `${departmentName}/${f}`
    }));
  }

  if (path.length === 1) {
    return [
      ...['Janeiro', 'Fevereiro', 'Março'].map(f => ({
        name: f,
        isFolder: true,
        path: `${departmentName}/${path[0]}/${f}`
      })),
      ...files.slice(0, 2).map(f => ({
        ...f,
        isFolder: false,
        path: `${departmentName}/${path[0]}/${f.name}`
      }))
    ];
  }

  return files.map(f => ({
    ...f,
    isFolder: false,
    path: `${departmentName}/${path.join('/')}/${f.name}`
  }));
};

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [files, setFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('departments');

  useEffect(() => {
    const storedUser = localStorage.getItem('sedemat_user');
    if (!storedUser) {
      navigate(createPageUrl('Acesso'));
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    loadData(userData);
  }, [navigate]);

  const loadData = async (userData) => {
    setIsLoading(true);
    try {
      // Load departments
      const allDepartments = await base44.entities.Department.filter({ ativo: true });
      
      // Filter based on user permissions
      const userDeptIds = userData.departamentos || [];
      const visibleDepartments = allDepartments.filter(d => 
        d.acesso_padrao || 
        userDeptIds.includes(d.id) ||
        userData.papel === 'GESTOR_TI'
      );
      
      setDepartments(visibleDepartments.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
      
      // Load favorites
      try {
        const userFavorites = await base44.entities.FavoriteFile.filter({ user_id: userData.id });
        setFavorites(userFavorites);
      } catch (e) {
        setFavorites([]);
      }
      
      // Load recent files
      try {
        const userRecents = await base44.entities.RecentFile.filter({ user_id: userData.id }, '-accessed_at', 10);
        setRecentFiles(userRecents);
      } catch (e) {
        setRecentFiles([]);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sedemat_user');
    navigate(createPageUrl('Acesso'));
  };

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setCurrentPath([]);
    setIsLoadingFiles(true);
    
    // Simulate loading files
    setTimeout(() => {
      setFiles(generateMockFiles(dept.nome, []));
      setIsLoadingFiles(false);
    }, 500);
  };

  const handleFolderClick = (folder) => {
    const newPath = [...currentPath, folder.name];
    setCurrentPath(newPath);
    setIsLoadingFiles(true);
    
    setTimeout(() => {
      setFiles(generateMockFiles(selectedDepartment.nome, newPath));
      setIsLoadingFiles(false);
    }, 300);
  };

  const handleBreadcrumbNavigate = (path) => {
    if (path.length === 0) {
      setSelectedDepartment(null);
      setCurrentPath([]);
      setFiles([]);
    } else {
      setCurrentPath(path);
      setIsLoadingFiles(true);
      setTimeout(() => {
        setFiles(generateMockFiles(selectedDepartment.nome, path));
        setIsLoadingFiles(false);
      }, 300);
    }
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    
    // Add to recent files
    if (user) {
      try {
        await base44.entities.RecentFile.create({
          user_id: user.id,
          file_path: file.path,
          file_name: file.name,
          department_id: selectedDepartment?.id,
          accessed_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error adding to recent:', err);
      }
    }
  };

  const handleMultiFilePreview = (files) => {
    setSelectedFiles(files);
  };

  const handleToggleFavorite = async (file) => {
    if (!user) return;
    
    const existingFav = favorites.find(f => f.file_path === file.path);
    
    try {
      if (existingFav) {
        await base44.entities.FavoriteFile.delete(existingFav.id);
        setFavorites(favorites.filter(f => f.id !== existingFav.id));
      } else {
        const newFav = await base44.entities.FavoriteFile.create({
          user_id: user.id,
          file_path: file.path,
          file_name: file.name,
          department_id: selectedDepartment?.id
        });
        setFavorites([...favorites, newFav]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
    setCurrentPath([]);
    setFiles([]);
    setSearchTerm('');
    setFilterType('all');
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const ext = file.extension?.toLowerCase();
    if (filterType === 'pdf') return matchesSearch && ext === 'pdf';
    if (filterType === 'word') return matchesSearch && ['doc', 'docx'].includes(ext);
    if (filterType === 'excel') return matchesSearch && ['xls', 'xlsx', 'csv'].includes(ext);
    if (filterType === 'image') return matchesSearch && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user} onLogout={handleLogout} showAdmin={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!selectedDepartment ? (
            <motion.div
              key="departments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="bg-white shadow-sm">
                  <TabsTrigger value="departments" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                    <Folder className="h-4 w-4 mr-2" />
                    Departamentos
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                    <Clock className="h-4 w-4 mr-2" />
                    Recentes
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                    <Star className="h-4 w-4 mr-2" />
                    Favoritos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="departments" className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Seus Departamentos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {departments.map((dept, index) => (
                      <DepartmentCard
                        key={dept.id}
                        department={dept}
                        onClick={handleDepartmentClick}
                        index={index}
                      />
                    ))}
                  </div>
                  
                  {departments.length === 0 && (
                    <div className="text-center py-16">
                      <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum departamento disponível</p>
                      <p className="text-gray-400 text-sm">Entre em contato com o Gestor de TI</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Arquivos Recentes</h2>
                  {recentFiles.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <FileList
                        files={recentFiles.map(r => ({
                          name: r.file_name,
                          path: r.file_path,
                          isFolder: false,
                          extension: r.file_name.split('.').pop()
                        }))}
                        onFileClick={handleFileClick}
                        onToggleFavorite={handleToggleFavorite}
                        favorites={favorites}
                        onFolderClick={() => {}}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum arquivo recente</p>
                      <p className="text-gray-400 text-sm">Os arquivos que você abrir aparecerão aqui</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="favorites" className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Arquivos Favoritos</h2>
                  {favorites.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <FileList
                        files={favorites.map(f => ({
                          name: f.file_name,
                          path: f.file_path,
                          isFolder: false,
                          extension: f.file_name.split('.').pop()
                        }))}
                        onFileClick={handleFileClick}
                        onToggleFavorite={handleToggleFavorite}
                        favorites={favorites}
                        onFolderClick={() => {}}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum favorito</p>
                      <p className="text-gray-400 text-sm">Marque arquivos com estrela para acesso rápido</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDepartments}
                  className="hover:bg-emerald-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedDepartment.nome}</h2>
                  <Breadcrumb 
                    path={[selectedDepartment.nome, ...currentPath]} 
                    onNavigate={(path) => {
                      if (path.length <= 1) {
                        handleBackToDepartments();
                      } else {
                        handleBreadcrumbNavigate(path.slice(1));
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <FileFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterType={filterType}
                  onFilterChange={setFilterType}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
                
                <FileList
                  files={filteredFiles}
                  onFolderClick={handleFolderClick}
                  onFileClick={handleFileClick}
                  onToggleFavorite={handleToggleFavorite}
                  onMultiFilePreview={handleMultiFilePreview}
                  favorites={favorites}
                  isLoading={isLoadingFiles}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onOpen={() => {
            alert(`Abrindo arquivo: ${selectedFile.name}`);
          }}
          onDownload={() => {
            alert(`Baixando arquivo: ${selectedFile.name}`);
          }}
          onToggleFavorite={() => handleToggleFavorite(selectedFile)}
          isFavorite={favorites.some(f => f.file_path === selectedFile.path)}
        />
      )}
      
      {selectedFiles.length > 0 && (
        <MultiFilePreview
          files={selectedFiles}
          onClose={() => setSelectedFiles([])}
          onOpen={(file) => {
            alert(`Abrindo arquivo: ${file.name}`);
          }}
          onDownload={(file) => {
            alert(`Baixando arquivo: ${file.name}`);
          }}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
      )}
    </div>
  );
}