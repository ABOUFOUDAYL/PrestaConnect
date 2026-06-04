export const BENIN_CRAFTS = [
    // --- MÉTIERS TECHNIQUES : L'artisan paie 200 FCFA ---
    { id: 'electricien', label: 'Électricien bâtiment', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'plombier', label: 'Plombier', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'macon', label: 'Maçon', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'menuisier', label: 'Menuisier (Bois/Alu)', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'peintre', label: 'Peintre en bâtiment', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'carreleur', label: 'Carreleur', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'mecanicien_auto', label: 'Mécanicien Automobile / Moto', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'frigoriste', label: 'Frigoriste (Clim/Frigo)', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'gantier_soudure', label: 'Soudeur / Métallurgiste', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'couturier', label: 'Couturier / Styliste', type: 'diploma', payer: 'artisan', price: 200 },
    { id: 'coiffeuse_dame', label: 'Coiffeuse / Tresseuse', type: 'diploma', payer: 'artisan', price: 200 },
  
    // --- MÉTIERS DE SERVICE DIRECT : Le client paie un montant différent (ex: 500 FCFA ou le prix de ton choix) ---
    { id: 'nounou', label: 'Nounou / Garde d\'enfants', type: 'criminal_record', payer: 'client', price: 500 },
    { id: 'menagere', label: 'Agent de ménage / Lessive', type: 'criminal_record', payer: 'client', price: 500 },
    { id: 'gardien', label: 'Gardien / Agent de sécurité', type: 'criminal_record', payer: 'client', price: 500 },
    { id: 'cuisinier_maison', label: 'Cuisinier à domicile', type: 'criminal_record', payer: 'client', price: 500 },
    { id: 'chauffeur', label: 'Chauffeur privé', type: 'criminal_record', payer: 'client', price: 500 }
  ];