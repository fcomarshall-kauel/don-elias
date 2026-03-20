'use client';
import { useLocalStorage } from './useLocalStorage';
import { Package, PackageType } from '@/types';

export function usePackages() {
  const [packages, setPackages] = useLocalStorage<Package[]>('porter_packages', []);

  const pendingPackages = packages.filter(p => p.status === 'pending');
  const deliveredPackages = packages
    .filter(p => p.status === 'delivered')
    .sort((a, b) => new Date(b.deliveredAt!).getTime() - new Date(a.deliveredAt!).getTime());

  const packagesByUnit = pendingPackages.reduce<Record<string, Package[]>>((acc, pkg) => {
    if (!acc[pkg.recipientApt]) acc[pkg.recipientApt] = [];
    acc[pkg.recipientApt].push(pkg);
    return acc;
  }, {});

  const addPackage = (data: { recipientApt: string; type: PackageType }) => {
    const newPkg: Package = {
      id: crypto.randomUUID(),
      ...data,
      receivedAt: new Date().toISOString(),
      status: 'pending',
    };
    setPackages(prev => [newPkg, ...prev]);
  };

  const markDelivered = (id: string) => {
    setPackages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'delivered', deliveredAt: new Date().toISOString() } : p
      )
    );
  };

  const markNotified = (id: string) => {
    setPackages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, notifiedAt: new Date().toISOString() } : p
      )
    );
  };

  return { packages, pendingPackages, deliveredPackages, packagesByUnit, addPackage, markDelivered, markNotified };
}
