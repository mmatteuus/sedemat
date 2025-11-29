import { Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Department } from '@/data/mockData';

interface DepartmentCardProps {
  department: Department;
  onClick: () => void;
}

const DepartmentCard = ({ department, onClick }: DepartmentCardProps) => {
  return (
    <Card
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-primary/20 hover:border-primary/40"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Folder className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-center text-sm leading-tight">{department.name}</h3>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
