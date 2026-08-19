type TypeNotification = 'relance_dossier' | 'compte_approuve' | 'nouvelle_demande';

export async function envoyerNotificationGlobal(
  telephone: string, 
  nom: string, 
  type: TypeNotification, 
  dataSupplementaire?: string
) {
  if (!telephone) return { success: false, error: "Téléphone manquant" };

  // Nettoyage et formatage du numéro au format international (+229...)
  let cleanPhone = telephone.replace(/\s+/g, '').replace('+', '');
  if (!cleanPhone.startsWith('229')) {
    cleanPhone = '229' + cleanPhone;
  }

  // Définition dynamique du message
  let message = "";
  switch (type) {
    case 'relance_dossier':
      message = `Bonjour ${nom || 'Artisan'}, c'est PrestaConnect. Votre dossier est incomplet. Pour l'activer et recevoir des clients, merci de compléter vos pièces ici : https://presta-connect.vercel.app/artisan/complete-documents`;
      break;
    case 'compte_approuve':
      message = `Félicitations ${nom || 'Artisan'} ! Votre compte PrestaConnect a été approuvé. Vous pouvez désormais recevoir des demandes clients.`;
      break;
    case 'nouvelle_demande':
      message = `Bonjour ${nom || 'Artisan'}, vous avez reçu une nouvelle demande sur PrestaConnect : "${dataSupplementaire || 'Vérifiez votre espace'}".`;
      break;
    default:
      message = `Bonjour ${nom || 'Artisan'}, vous avez une nouvelle notification sur PrestaConnect.`;
  }

  let success = false;
  let canalUtilise = '';

  // --- 1. Tentative WhatsApp ---
  try {
    const waRes = await fetch(`https://api.ultramsg.com/${process.env.WHATSAPP_INSTANCE_ID}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.WHATSAPP_TOKEN,
        to: cleanPhone,
        body: message
      })
    });
    const waData = await waRes.json();
    if (waRes.ok && waData.sent) {
      success = true;
      canalUtilise = 'WhatsApp';
    }
  } catch (err) {
    console.log("WhatsApp indisponible, basculement SMS...");
  }

  // --- 2. Fallback SMS si WhatsApp échoue ---
  if (!success) {
    try {
      const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: '+' + cleanPhone,
          From: process.env.TWILIO_PHONE_NUMBER || 'PrestaConnect',
          Body: message
        })
      });

      if (smsRes.ok) {
        success = true;
        canalUtilise = 'SMS';
      }
    } catch (err) {
      console.error("Erreur SMS:", err);
    }
  }

  return { success, canal: canalUtilise };
}