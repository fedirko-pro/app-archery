import type { EmailI18n } from './types';

export const it: EmailI18n = {
  footer: "Questa è un'e-mail automatica. Si prega di non rispondere a questo messaggio.",

  passwordReset: {
    subject: 'Richiesta di reimpostazione della password',
    heading: 'Richiesta di Reimpostazione della Password',
    hello: 'Ciao,',
    body: 'Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account. Clicca il pulsante qui sotto per impostare una nuova password:',
    ctaLabel: 'Reimposta Password',
    linkFallback:
      'Se il pulsante non funziona, puoi copiare e incollare questo link nel tuo browser:',
    expiry: 'Questo link scadrà tra 1 ora per ragioni di sicurezza.',
    ignoreNote: 'Se non hai richiesto questa reimpostazione della password, ignora questa e-mail.',
  },

  welcome: {
    subject: 'Benvenuto/a su Archery App!',
    heading: 'Benvenuto/a su Archery App!',
    greeting: 'Ciao {{name}},',
    intro:
      "Grazie per esserti unito/a alla nostra comunità di tiro con l'arco! Siamo entusiasti di averti con noi.",
    features: [
      'Completa il tuo profilo',
      'Partecipa alle competizioni',
      'Tieni traccia dei tuoi progressi',
      'Connettiti con altri arcieri',
    ],
    helpNote: 'Se hai domande, non esitare a contattare il nostro team di supporto.',
  },

  invitation: {
    subject: 'Sei invitato/a su Archery App',
    heading: 'Sei Invitato/a su Archery App',
    body: '{{adminName}} ha creato un account per te su Archery App. Clicca il pulsante qui sotto per impostare la tua password e iniziare:',
    ctaLabel: 'Imposta la Tua Password',
    linkFallback: 'Se il pulsante non funziona, copia e incolla questo link nel tuo browser:',
    expiry: 'Questo link scadrà tra 24 ore.',
    ignoreNote: 'Se non ti aspettavi questo invito, puoi ignorare questa e-mail tranquillamente.',
  },

  applicationSubmitted: {
    subject: 'Candidatura Inviata – {{tournamentTitle}}',
    heading: 'Candidatura Inviata',
    greeting: 'Ciao {{name}},',
    successMessage: 'La tua candidatura per {{tournamentTitle}} è stata inviata con successo.',
    labelTournament: 'Torneo',
    labelDate: 'Data',
    labelLocation: 'Luogo',
    waitMessage:
      "Attendi mentre l'amministratore esamina la tua candidatura. Riceverai un'altra e-mail quando verrà presa una decisione.",
    ctaLabel: 'Visualizza le Mie Candidature',
    months: [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Candidatura Approvata – {{tournamentTitle}}',
    subjectRejected: 'Aggiornamento Candidatura – {{tournamentTitle}}',
    headingApproved: 'Candidatura al Torneo Approvata ✓',
    headingUpdate: 'Aggiornamento Candidatura al Torneo',
    greeting: 'Ciao {{name}},',
    approvedMessage:
      'Ottime notizie! La tua candidatura per {{tournamentTitle}} è stata approvata.',
    approvedDetail:
      'Sei ora registrato/a per questo torneo. Controlla i dettagli della tua candidatura e preparati per la competizione.',
    approvedLookForward: "Non vediamo l'ora di vederti lì!",
    rejectedMessage: 'La tua candidatura per {{tournamentTitle}} è stata esaminata.',
    feedbackLabel: 'Feedback:',
    questionsNote: 'Se hai domande o dubbi, non esitare a contattarci.',
    ctaLabel: 'Visualizza le Mie Candidature',
  },

  roleChanged: {
    subject: 'Il tuo ruolo è stato aggiornato – Archery App',
    heading: 'Il Tuo Ruolo È Stato Aggiornato',
    greeting: 'Ciao {{name}},',
    body: '{{adminName}} ha aggiornato il tuo ruolo su Archery App:',
    permissionsHeading: 'Con il ruolo {{role}} puoi:',
    questionsNote: 'Se hai domande sui tuoi nuovi permessi, contatta il tuo amministratore.',
    ctaLabel: 'Visualizza il Mio Profilo',
    roleLabels: {
      user: 'Utente',
      club_admin: 'Admin Club',
      federation_admin: 'Admin Federazione',
      general_admin: 'Admin Generale',
    },
    rolePermissions: {
      user: [
        'Sfogliare e visualizzare i tornei',
        'Inviare candidature ai tornei',
        'Visualizzare e gestire le proprie candidature',
        'Modificare il proprio profilo',
      ],
      club_admin: [
        'Creare e modificare tornei',
        'Visualizzare e gestire le candidature ai tornei',
        'Iscrivere altri utenti ai tornei',
        'Creare e modificare utenti',
      ],
      federation_admin: [
        'Creare e modificare tornei',
        'Eliminare tornei',
        'Visualizzare e gestire le candidature ai tornei',
        'Modificare ed eliminare candidature, generare PDF',
        'Iscrivere altri utenti ai tornei',
        'Creare, modificare ed eliminare utenti',
      ],
      general_admin: [
        'Accesso completo a tutti i tornei e candidature',
        'Creare, modificare ed eliminare utenti',
        'Gestire i dati di riferimento (categorie, club, divisioni, regole)',
        'Gestire i permessi dei ruoli (Controllo degli Accessi)',
        'Tutte le altre capacità amministrative',
      ],
    },
  },

  clubInvitation: {
    subject: 'Sei invitato a unirti a {{clubName}}',
    heading: 'Invito al Club',
    greeting: 'Sei stato invitato a unirti a {{clubName}}.',
    body: '{{inviterName}} (Admin del Club {{clubName}}) ti ha invitato a unirti al suo club. Puoi accettare questo invito o ignorare questa email.',
    ctaLabel: 'Unirsi al Club',
    linkFallback: 'Se il pulsante non funziona, copia e incolla questo link nel tuo browser:',
    ignoreNote: 'Se non ti aspettavi questo invito, puoi ignorare questa email in sicurezza.',
  },

  clubJoined: {
    subject: 'Nuovo membro si è unito a {{clubName}}',
    heading: 'Nuovo Membro del Club',
    greeting: 'Un nuovo membro si è unito a {{clubName}}.',
    body: '{{userName}} si è unito a {{clubName}}.',
    viewProfile: 'Visualizza profilo: {{profileUrl}}',
  },

  clubLeft: {
    subject: 'Membro ha lasciato {{clubName}}',
    heading: 'Membro del Club Ha Lasciato',
    greeting: 'Un membro ha lasciato {{clubName}}.',
    body: '{{userName}} ha lasciato {{clubName}}.',
    viewProfile: 'Visualizza profilo: {{profileUrl}}',
  },

  federationInvitation: {
    subject: '{{federationName}} invita il tuo club a unirsi',
    heading: 'Invito alla Federazione',
    greeting: '{{federationName}} ha invitato il tuo club a unirsi.',
    body: '{{inviterName}} (Admin della Federazione {{federationName}}) ha invitato {{clubName}} a unirsi alla federazione. Puoi accettare questo invito o ignorare questa email.',
    ctaLabel: 'Accetta Invito',
    linkFallback: 'Se il pulsante non funziona, copia e incolla questo link nel tuo browser:',
    ignoreNote: 'Se non ti aspettavi questo invito, puoi ignorare questa email in sicurezza.',
  },

  federationClubJoined: {
    subject: '{{clubName}} si è unito a {{federationName}}',
    heading: 'Club Si È Unito Alla Federazione',
    greeting: '{{federationName}} ha un nuovo club membro.',
    body: '{{clubName}} si è unito a {{federationName}}.',
  },

  federationClubRemoved: {
    subject: 'Club rimosso da {{federationName}}',
    heading: 'Club Rimosso Dalla Federazione',
    greeting: 'Un club è stato rimosso da {{federationName}}.',
    body: '{{clubName}} è stato rimosso da {{federationName}} da {{removedBy}}.',
  },

  clubJoinRequestNotification: {
    subject: 'Nuova richiesta di iscrizione a {{clubName}}',
    heading: 'Nuova richiesta di iscrizione al club',
    greeting: 'Qualcuno vuole iscriversi a {{clubName}}.',
    body: '{{requesterName}} ({{requesterEmail}}) ha richiesto di iscriversi a {{clubName}}.',
    messageLabel: 'Messaggio:',
    reviewNote: 'Rivedi e rispondi in Il mio club: {{reviewUrl}}',
  },

  clubJoinRequestApproved: {
    subject: 'Benvenuto in {{clubName}}',
    heading: 'Richiesta di iscrizione approvata',
    greeting: 'Ciao {{name}},',
    body: 'La tua richiesta di iscrizione a {{clubName}} è stata approvata.',
    profileNote: 'Vedi il tuo profilo: {{profileUrl}}',
  },

  clubJoinRequestRejected: {
    subject: 'Aggiornamento sulla richiesta per {{clubName}}',
    heading: 'Aggiornamento richiesta di iscrizione',
    greeting: 'Ciao {{name}},',
    body: 'La tua richiesta di iscrizione a {{clubName}} non è stata approvata in questo momento.',
    note: 'Se hai domande, contatta direttamente il club.',
  },
};
