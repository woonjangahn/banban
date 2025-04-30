'use client';

import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/layout/Footer').then(mod => mod.Footer), {
  ssr: false
});

export default function ClientFooter() {
  return <Footer />;
}