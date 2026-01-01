import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Mountain, Crown, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';

const roleConfig: Record<UserRole, { icon: React.ElementType; label: string; color: string }> = {
  owner: { icon: Crown, label: 'Owner', color: 'text-secondary' },
  admin: { icon: Shield, label: 'Admin', color: 'text-primary' },
  user: { icon: User, label: 'Devotee', color: 'text-success' },
};

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const config = roleConfig[user.role];
  const RoleIcon = config.icon;

  return (
    <header className="bg-card border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-lg text-foreground">
                Sabarimala Yatra 2026
              </h1>
              <div className="flex items-center gap-1.5 text-sm">
                <RoleIcon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`font-medium ${config.color}`}>{config.label}</span>
                {user.name && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{user.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
