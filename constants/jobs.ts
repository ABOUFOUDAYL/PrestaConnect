export const BENIN_CRAFTS = [
  // --- MÉTIERS TECHNIQUES : L'artisan paie selon urgence ---
  // price = cas normal (300), price_urgent = cas urgent (300), price_grand_chantier = grand chantier (1500)
  { id: 'electricien', label: 'Électricien bâtiment', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'plombier', label: 'Plombier', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'macon', label: 'Maçon', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'menuisier', label: 'Menuisier (Bois/Alu)', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'peintre', label: 'Peintre en bâtiment', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'carreleur', label: 'Carreleur', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'mecanicien_auto', label: 'Mécanicien Automobile / Moto', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'frigoriste', label: 'Frigoriste (Clim/Frigo)', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'gantier_soudure', label: 'Soudeur / Métallurgiste', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'couturier', label: 'Couturier / Styliste', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },
  { id: 'coiffeuse_dame', label: 'Coiffeuse / Tresseuse', type: 'diploma', payer: 'artisan', price: 300, price_urgent: 300, price_grand_chantier: 1500 },

  // --- MÉTIERS DE SERVICE DIRECT : Le client paie 500 FCFA ---
  { id: 'nounou', label: 'Nounou / Garde d\'enfants', type: 'criminal_record', payer: 'client', price: 500, price_urgent: 500, price_grand_chantier: 500 },
  { id: 'menagere', label: 'Agent de ménage / Lessive', type: 'criminal_record', payer: 'client', price: 500, price_urgent: 500, price_grand_chantier: 500 },
  { id: 'gardien', label: 'Gardien / Agent de sécurité', type: 'criminal_record', payer: 'client', price: 500, price_urgent: 500, price_grand_chantier: 500 },
  { id: 'cuisinier_maison', label: 'Cuisinier à domicile', type: 'criminal_record', payer: 'client', price: 500, price_urgent: 500, price_grand_chantier: 500 },
  { id: 'chauffeur', label: 'Chauffeur privé', type: 'criminal_record', payer: 'client', price: 500, price_urgent: 500, price_grand_chantier: 500 },
];