import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase (Service Role pour contourner RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialisation Resend (Email)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuration UltraMsg (WhatsApp)
const ultraMsgInstanceId = process.env.WHATSAPP_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE_ID;
const ultraMsgToken = process.env.WHATSAPP_TOKEN || process.env.ULTRAMSG_TOKEN;

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
 * Envoie un email via Resend.
 * LIMITATION ACTUELLE : le domaine prestaconnect.bj n'est pas encore vérifié
 * dans Resend (pas de domaine personnalisé disponible pour le moment).
 * En mode sandbox, Resend n'autorise l'envoi que vers l'adresse email
 * associée au compte Resend (sabirousayo@gmail.com).
 * Tant que le domaine n'est pas vérifié, les emails vers les artisans
 * échoueront systématiquement (sauf si leur email est exactement
 * sabirousayo@gmail.com). L'échec est loggé dans logs_notifications.
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
      from: 'PrestaConnect <onboarding@resend.dev>',
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
 * Envoie un message WhatsApp via UltraMsg
 */
export async function envoyerWhatsAppUltraMsg(payload: NotificationPayload): Promise<boolean> {
  if (!payload.telephone) return false;
  const telephoneFormate = formaterTelephoneBenin(payload.telephone);

  if (!ultraMsgInstanceId || !ultraMsgToken) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'whatsapp',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: 'Variables WHATSAPP_INSTANCE_ID ou WHATSAPP_TOKEN non configurées',
    });
    return false;
  }

  try {
    const url = `https://api.ultramsg.com/${ultraMsgInstanceId}/messages/chat`;
    const params = new URLSearchParams({
      token: ultraMsgToken,
      to: telephoneFormate,
      body: payload.messageTexte,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.sent === 'true' || data.id) {
      await loggerNotification({
        prestataireId: payload.prestataireId,
        canal: 'whatsapp',
        destinataire: telephoneFormate,
        typeEvenement: payload.typeEvenement,
        statut: 'succes',
        metadata: { messageId: data.id },
      });
      return true;
    } else {
      throw new Error(data.error || 'Erreur UltraMsg inconnue');
    }
  } catch (err: any) {
    await loggerNotification({
      prestataireId: payload.prestataireId,
      canal: 'whatsapp',
      destinataire: telephoneFormate,
      typeEvenement: payload.typeEvenement,
      statut: 'echec',
      erreurMessage: err.message || 'Erreur réseau UltraMsg',
    });
    return false;
  }
}

/**
 * Orchestrateur central : tente Email + WhatsApp via UltraMsg
 */
export async function notifierArtisanGlobal(payload: NotificationPayload) {
  const resultats = {
    emailSent: false,
    whatsappSent: false,
  };

  // 1. Envoi e-mail via Resend
  if (payload.email) {
    resultats.emailSent = await envoyerEmailNotif(payload);
  }

  // 2. Envoi WhatsApp via UltraMsg
  if (payload.telephone) {
    resultats.whatsappSent = await envoyerWhatsAppUltraMsg(payload);
  }

  return resultats;
}