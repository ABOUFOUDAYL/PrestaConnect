import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Initialisation des clients Supabase (Service Role pour contourner la RLS lors du logging serveur)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialisation Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Initialisation Twilio
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER; // Format: +1234567890 ou whatsapp:+1234567890
const twilioClient = (twilioSid && twilioToken) ? twilio(twilioSid, twilioToken) : null;

export interface NotificationPayload {
  prestataireId: string;
  email?: string;
  telephone?: string;
  nom: string;
  typeEvenement: 'relance_dossier_incomplet' | 'validation_compte' | 'rejet_dossier' | 'general';
  sujetEmail?: string;
  messageTexte: string;
  htmlEmail?: string;
}

/**
 * Normalise un numéro de téléphone au format E.164 béninois (+229XXXXXXXX)
 */
export function formaterTelephoneBenin(phone: string): string {
  let net = phone.replace(/\s+|\+|\-|\(\)/g, '');
  if (!net.startsWith('229')) {
    net = `229${net}`;
  }
  return `+${net}`;
}

/**
 * Enregistre le résultat de l'envoi dans public.logs_notifications
 */
async function loggerNotification(params: {
  prestataireId: string;
  canal: 'email' | 'whatsapp' | 'sms';
  destinataire: string;
  typeEvenement: string;
  statut: 'succes' | 'echec' | 'en_attente';
  erreurMessage?: string;
  metadata?: Record<string, any>;
}) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) return;

    await supabase.from('logs_notifications').insert({
      prestataire_id: params.prestataireId,
      canal: params.canal,
      destinataire: params.destinataire,
      type_evenement: params.typeEvenement,
      statut: params.statut,
      erreur_message: params.erreurMessage || null,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error('[LOG_NOTIF_ERROR]', err);
  }
}

/**
 * Envoie un email via Resend
 */
export async function envoyerEmailNotif(payload: NotificationPayload): Promise<boolean> {
  if (!payload.email) return false;
  if (!resend) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'email',
      destinataire: payload.email,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: 'RESEND_API_KEY non configurée dans .env',
    });
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'PrestaConnect <notifications@prestaconnect.bj>',
      to: [payload.email],
      subject: payload.sujetEmail || 'Notification PrestaConnect',
      html: payload.htmlEmail || `<p>${payload.messageTexte}</p>`,
    });

    if (error) throw new Error(error.message);

    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'email',
      destinataire: payload.email,
      typeEvenement: payload.typeEvenement,
      statut: 'succes',
    });
    return true;
  } catch (err: any) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'email',
      destinataire: payload.email,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: err.message || 'Erreur inconnue Resend',
    });
    return false;
  }
}

/**
 * Envoie un message WhatsApp via Twilio
 */
export async function envoyerWhatsAppNotif(payload: NotificationPayload): Promise<boolean> {
  if (!payload.telephone) return false;
  const telephoneFormate = formaterTelephoneBenin(payload.telephone);

  if (!twilioClient || !twilioPhone) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'whatsapp',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: 'Variables Twilio non configurées dans .env',
    });
    return false;
  }

  try {
    const message = await twilioClient.messages.create({
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${telephoneFormate}`,
      body: payload.messageTexte,
    });

    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'whatsapp',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'succes',
      metadata: { sid: message.sid },
    });
    return true;
  } catch (err: any) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'whatsapp',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: err.message || 'Erreur WhatsApp Twilio',
    });
    return false;
  }
}

/**
 * Envoie un SMS via Twilio (Fallback si WhatsApp échoue ou si préféré)
 */
export async function envoyerSMSNotif(payload: NotificationPayload): Promise<boolean> {
  if (!payload.telephone) return false;
  const telephoneFormate = formaterTelephoneBenin(payload.telephone);

  if (!twilioClient || !twilioPhone) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'sms',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: 'Variables Twilio non configurées dans .env',
    });
    return false;
  }

  try {
    const message = await twilioClient.messages.create({
      from: twilioPhone.replace('whatsapp:', ''),
      to: telephoneFormate,
      body: payload.messageTexte,
    });

    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'sms',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'succes',
      metadata: { sid: message.sid },
    });
    return true;
  } catch (err: any) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'sms',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: err.message || 'Erreur SMS Twilio',
    });
    return false;
  }
}

/**
 * Orchestrateur central : tente Email + WhatsApp, avec fallback SMS
 */
export async function notifierArtisanGlobal(payload: NotificationPayload) {
  const resultats = {
    emailSent: false,
    whatsappSent: false,
    smsSent: false,
  };

  // 1. Tenter l'envoi d'e-mail si disponible
  if (payload.email) {
    resultats.emailSent = await envoyerEmailNotif(payload);
  }

  // 2. Tenter WhatsApp
  if (payload.telephone) {
    resultats.whatsappSent = await envoyerWhatsAppNotif(payload);

    // 3. Fallback SMS si WhatsApp a échoué
    if (!resultats.whatsappSent) {
      resultats.smsSent = await envoyerSMSNotif(payload);
    }
  }

  return resultats;
}