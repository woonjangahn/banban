'use client';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/layout/Navbar').then(mod => mod.Navbar), {
  ssr: false
});

export default function ClientNavbar() {
  return <Navbar />;
}