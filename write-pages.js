const fs = require('fs');

const content = (title) => `"use client";
export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">${title}</h1>
      <p className="text-gray-500">Page en cours de construction...</p>
    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/dashboard/messages/page.tsx', content('Messages'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/paiements/page.tsx', content('Paiements'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/parametres/page.tsx', content('Parametres'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/services/page.tsx', content('Mes services'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/reservations/page.tsx', content('Reservations'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/avis/page.tsx', content('Avis'), 'utf8');
fs.writeFileSync('app/(dashboard)/dashboard/annonces/page.tsx', content('Mes annonces'), 'utf8');

console.log('done!');