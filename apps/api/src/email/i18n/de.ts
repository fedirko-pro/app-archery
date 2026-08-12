import { EmailI18n } from './types';

export const de: EmailI18n = {
  footer:
    'Dies ist eine automatische E-Mail von Sokil. Bitte antworten Sie nicht auf diese Nachricht.',
  signOff: 'Mit freundlichen Grüßen,',
  teamName: 'Das Sokil-Team',
  appDescription:
    'Sokil ist eine Plattform für das Bogenschießen-Management für Vereine, Verbände und Athleten.',
  supportLabel: 'Hilfe benötigt?',
  supportAction: 'Support kontaktieren',

  passwordReset: {
    subject: 'Passwort zurücksetzen',
    preview: 'Setzen Sie Ihr Sokil-Passwort zurück — dieser Link läuft in 1 Stunde ab.',
    heading: 'Passwort zurücksetzen',
    hello: 'Hallo,',
    body: 'Wir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr Sokil-Konto erhalten. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort festzulegen:',
    ctaLabel: 'Passwort zurücksetzen',
    linkFallback:
      'Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:',
    expiry: 'Dieser Link läuft aus Sicherheitsgründen in 1 Stunde ab.',
    ignoreNote:
      'Wenn Sie diese Passwortzurücksetzung nicht angefordert haben, ignorieren Sie diese E-Mail bitte.',
  },

  welcome: {
    subject: 'Willkommen bei Sokil!',
    preview:
      'Willkommen bei Sokil! Vervollständigen Sie Ihr Profil und nehmen Sie an Wettbewerben teil.',
    heading: 'Willkommen bei Sokil!',
    greeting: 'Hallo {{name}},',
    intro:
      'Vielen Dank, dass Sie der Sokil-Bogenschützen-Community beigetreten sind! Wir freuen uns, Sie an Bord zu haben.',
    features: [
      'Vervollständigen Sie Ihr Profil',
      'Nehmen Sie an Wettbewerben teil',
      'Verfolgen Sie Ihre Fortschritte',
      'Vernetzen Sie sich mit anderen Bogenschützen',
    ],
    helpNote: 'Wenn Sie Fragen haben, wenden Sie sich bitte an unser Support-Team.',
  },

  invitation: {
    subject: 'Sie sind zu Sokil eingeladen',
    preview: 'Sie sind zu Sokil eingeladen. Legen Sie Ihr Passwort fest, um loszulegen.',
    heading: 'Sie sind zu Sokil eingeladen',
    body: '{{adminName}} hat ein Konto für Sie auf Sokil erstellt. Klicken Sie auf die Schaltfläche unten, um Ihr Passwort festzulegen und loszulegen:',
    ctaLabel: 'Passwort festlegen',
    linkFallback:
      'Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:',
    expiry: 'Dieser Link läuft in 24 Stunden ab.',
    ignoreNote:
      'Wenn Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail problemlos ignorieren.',
  },

  applicationSubmitted: {
    subject: 'Bewerbung eingereicht – {{tournamentTitle}}',
    preview: 'Ihre Bewerbung für {{tournamentTitle}} wurde eingereicht.',
    heading: 'Bewerbung eingereicht',
    greeting: 'Hallo {{name}},',
    successMessage: 'Ihre Bewerbung für {{tournamentTitle}} wurde erfolgreich eingereicht.',
    labelTournament: 'Turnier',
    labelDate: 'Datum',
    labelLocation: 'Ort',
    waitMessage:
      'Bitte warten Sie, während der Administrator Ihre Bewerbung prüft. Sie erhalten eine weitere E-Mail, sobald eine Entscheidung getroffen wurde.',
    ctaLabel: 'Meine Bewerbungen anzeigen',
    months: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Bewerbung genehmigt – {{tournamentTitle}}',
    subjectRejected: 'Bewerbungsupdate – {{tournamentTitle}}',
    previewApproved: 'Ihre Bewerbung für {{tournamentTitle}} wurde genehmigt.',
    previewRejected: 'Ihre Bewerbung für {{tournamentTitle}} wurde geprüft.',
    headingApproved: 'Turnierbewerbung genehmigt ✓',
    headingUpdate: 'Turnierbewerbungsupdate',
    greeting: 'Hallo {{name}},',
    approvedMessage: 'Gute Nachrichten! Ihre Bewerbung für {{tournamentTitle}} wurde genehmigt.',
    approvedDetail:
      'Sie sind jetzt für dieses Turnier registriert. Bitte überprüfen Sie Ihre Bewerbungsdetails und bereiten Sie sich auf den Wettbewerb vor.',
    approvedLookForward: 'Wir freuen uns auf Sie!',
    rejectedMessage: 'Ihre Bewerbung für {{tournamentTitle}} wurde geprüft.',
    feedbackLabel: 'Feedback:',
    questionsNote:
      'Wenn Sie Fragen oder Bedenken haben, zögern Sie bitte nicht, uns zu kontaktieren.',
    ctaLabel: 'Meine Bewerbungen anzeigen',
  },

  roleChanged: {
    subject: 'Ihre Rolle wurde aktualisiert – Sokil',
    preview: 'Ihre Rolle in Sokil wurde auf {{newRole}} aktualisiert.',
    heading: 'Ihre Rolle wurde aktualisiert',
    greeting: 'Hallo {{name}},',
    body: '{{adminName}} hat Ihre Rolle in Sokil aktualisiert:',
    permissionsHeading: 'Mit der Rolle {{role}} können Sie:',
    questionsNote:
      'Wenn Sie Fragen zu Ihren neuen Berechtigungen haben, wenden Sie sich bitte an Ihren Administrator.',
    ctaLabel: 'Mein Profil anzeigen',
    roleLabels: {
      user: 'Benutzer',
      club_admin: 'Club-Admin',
      federation_admin: 'Verbands-Admin',
      general_admin: 'General-Admin',
    },
    rolePermissions: {
      user: [
        'Turniere durchsuchen und anzeigen',
        'Bewerbungen für Turniere einreichen',
        'Eigene Bewerbungen anzeigen und verwalten',
        'Profil bearbeiten',
      ],
      club_admin: [
        'Turniere erstellen und bearbeiten',
        'Turnierbewerbungen anzeigen und verwalten',
        'Andere Benutzer für Turniere bewerben',
        'Benutzer erstellen und bearbeiten',
      ],
      federation_admin: [
        'Turniere erstellen und bearbeiten',
        'Turniere löschen',
        'Turnierbewerbungen anzeigen und verwalten',
        'Bewerbungen bearbeiten und löschen, PDFs generieren',
        'Andere Benutzer für Turniere bewerben',
        'Benutzer erstellen, bearbeiten und löschen',
      ],
      general_admin: [
        'Vollzugriff auf alle Turniere und Bewerbungen',
        'Benutzer erstellen, bearbeiten und löschen',
        'Referenzdaten verwalten (Kategorien, Clubs, Divisionen, Regeln)',
        'Rollenberechtigungen verwalten (Zugriffssteuerung)',
        'Alle anderen Admin-Funktionen',
      ],
    },
  },

  clubInvitation: {
    subject: 'Sie sind eingeladen, {{clubName}} beizutreten',
    preview: 'Sie wurden eingeladen, {{clubName}} beizutreten.',
    heading: 'Clubeinladung',
    greeting: 'Sie wurden eingeladen, {{clubName}} beizutreten.',
    body: '{{inviterName}} (Club-Admin von {{clubName}}) hat Sie eingeladen, seinem Club beizutreten. Sie können diese Einladung annehmen oder diese E-Mail ignorieren.',
    ctaLabel: 'Club beitreten',
    linkFallback:
      'Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:',
    ignoreNote:
      'Wenn Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail problemlos ignorieren.',
  },

  clubJoined: {
    subject: 'Neues Mitglied ist {{clubName}} beigetreten',
    preview: '{{userName}} ist {{clubName}} beigetreten.',
    heading: 'Neues Clubmitglied',
    greeting: 'Ein neues Mitglied ist {{clubName}} beigetreten.',
    body: '{{userName}} ist {{clubName}} beigetreten.',
    viewProfile: 'Profil anzeigen',
  },

  clubLeft: {
    subject: 'Mitglied hat {{clubName}} verlassen',
    preview: '{{userName}} hat {{clubName}} verlassen.',
    heading: 'Clubmitglied hat verlassen',
    greeting: 'Ein Mitglied hat {{clubName}} verlassen.',
    body: '{{userName}} hat {{clubName}} verlassen.',
    viewProfile: 'Profil anzeigen',
  },

  federationInvitation: {
    subject: '{{federationName}} lädt Ihren Club ein, beizutreten',
    preview: '{{federationName}} hat Ihren Club eingeladen, beizutreten.',
    heading: 'Verbandseinladung',
    greeting: '{{federationName}} hat Ihren Club eingeladen, beizutreten.',
    body: '{{inviterName}} (Verbands-Admin von {{federationName}}) hat {{clubName}} eingeladen, dem Verband beizutreten. Sie können diese Einladung annehmen oder diese E-Mail ignorieren.',
    ctaLabel: 'Einladung annehmen',
    linkFallback:
      'Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:',
    ignoreNote:
      'Wenn Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail problemlos ignorieren.',
  },

  federationClubJoined: {
    subject: '{{clubName}} ist {{federationName}} beigetreten',
    preview: '{{clubName}} ist {{federationName}} beigetreten.',
    heading: 'Club ist dem Verband beigetreten',
    greeting: '{{federationName}} hat einen neuen Mitgliedsclub.',
    body: '{{clubName}} ist {{federationName}} beigetreten.',
  },

  federationClubRemoved: {
    subject: 'Club aus {{federationName}} entfernt',
    preview: '{{clubName}} wurde aus {{federationName}} entfernt.',
    heading: 'Club aus Verband entfernt',
    greeting: 'Ein Club wurde aus {{federationName}} entfernt.',
    body: '{{clubName}} wurde aus {{federationName}} von {{removedBy}} entfernt.',
  },

  clubJoinRequestNotification: {
    subject: 'Neue Beitrittsanfrage für {{clubName}}',
    preview: '{{requesterName}} möchte {{clubName}} beitreten.',
    heading: 'Neue Club-Beitrittsanfrage',
    greeting: 'Jemand möchte {{clubName}} beitreten.',
    body: '{{requesterName}} ({{requesterEmail}}) hat beantragt, {{clubName}} beizutreten.',
    messageLabel: 'Nachricht:',
    reviewNote: 'Überprüfen und antworten Sie in Mein Club',
  },

  clubJoinRequestApproved: {
    subject: 'Willkommen bei {{clubName}}',
    preview: 'Ihre Anfrage, {{clubName}} beizutreten, wurde genehmigt.',
    heading: 'Club-Beitrittsanfrage genehmigt',
    greeting: 'Hallo {{name}},',
    body: 'Ihre Anfrage, {{clubName}} beizutreten, wurde genehmigt.',
    profileNote: 'Ihr Profil anzeigen',
  },

  clubJoinRequestRejected: {
    subject: 'Update zu Ihrer Beitrittsanfrage für {{clubName}}',
    preview: 'Ihre Anfrage, {{clubName}} beizutreten, wurde aktuell nicht genehmigt.',
    heading: 'Update zur Club-Beitrittsanfrage',
    greeting: 'Hallo {{name}},',
    body: 'Ihre Anfrage, {{clubName}} beizutreten, wurde aktuell nicht genehmigt.',
    note: 'Wenn Sie Fragen haben, wenden Sie sich bitte direkt an den Club.',
  },
};
