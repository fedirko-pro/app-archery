import type { EmailI18n } from './types';

export const es: EmailI18n = {
  footer: 'Este es un correo electrónico automático. Por favor, no respondas a este mensaje.',

  passwordReset: {
    subject: 'Solicitud de restablecimiento de contraseña',
    heading: 'Solicitud de Restablecimiento de Contraseña',
    hello: 'Hola,',
    body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para establecer una nueva contraseña:',
    ctaLabel: 'Restablecer Contraseña',
    linkFallback: 'Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 1 hora por razones de seguridad.',
    ignoreNote: 'Si no solicitaste este restablecimiento de contraseña, ignora este correo.',
  },

  welcome: {
    subject: '¡Bienvenido/a a Archery App!',
    heading: '¡Bienvenido/a a Archery App!',
    greeting: 'Hola {{name}},',
    intro:
      '¡Gracias por unirte a nuestra comunidad de tiro con arco! Estamos encantados de tenerte con nosotros.',
    features: [
      'Completa tu perfil',
      'Únete a competiciones',
      'Sigue tu progreso',
      'Conéctate con otros arqueros',
    ],
    helpNote: 'Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.',
  },

  invitation: {
    subject: 'Estás invitado/a a Archery App',
    heading: 'Estás Invitado/a a Archery App',
    body: '{{adminName}} ha creado una cuenta para ti en Archery App. Haz clic en el botón de abajo para establecer tu contraseña y comenzar:',
    ctaLabel: 'Establecer Contraseña',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 24 horas.',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este correo con seguridad.',
  },

  applicationSubmitted: {
    subject: 'Solicitud Enviada – {{tournamentTitle}}',
    heading: 'Solicitud Enviada',
    greeting: 'Hola {{name}},',
    successMessage: 'Tu solicitud para {{tournamentTitle}} ha sido enviada con éxito.',
    labelTournament: 'Torneo',
    labelDate: 'Fecha',
    labelLocation: 'Ubicación',
    waitMessage:
      'Por favor, espera mientras el administrador revisa tu solicitud. Recibirás otro correo cuando se tome una decisión.',
    ctaLabel: 'Ver Mis Solicitudes',
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Solicitud Aprobada – {{tournamentTitle}}',
    subjectRejected: 'Actualización de Solicitud – {{tournamentTitle}}',
    headingApproved: 'Solicitud de Torneo Aprobada ✓',
    headingUpdate: 'Actualización de Solicitud de Torneo',
    greeting: 'Hola {{name}},',
    approvedMessage: '¡Buenas noticias! Tu solicitud para {{tournamentTitle}} ha sido aprobada.',
    approvedDetail:
      'Ahora estás registrado/a en este torneo. Revisa los detalles de tu solicitud y prepárate para la competición.',
    approvedLookForward: '¡Esperamos verte allí!',
    rejectedMessage: 'Tu solicitud para {{tournamentTitle}} ha sido revisada.',
    feedbackLabel: 'Comentarios:',
    questionsNote: 'Si tienes alguna pregunta o inquietud, no dudes en contactarnos.',
    ctaLabel: 'Ver Mis Solicitudes',
  },

  roleChanged: {
    subject: 'Tu función ha sido actualizada – Archery App',
    heading: 'Tu Función Ha Sido Actualizada',
    greeting: 'Hola {{name}},',
    body: '{{adminName}} ha actualizado tu función en Archery App:',
    permissionsHeading: 'Con la función {{role}} puedes:',
    questionsNote:
      'Si tienes alguna pregunta sobre tus nuevos permisos, contacta a tu administrador.',
    ctaLabel: 'Ver Mi Perfil',
    roleLabels: {
      user: 'Usuario',
      club_admin: 'Admin de Club',
      federation_admin: 'Admin de Federación',
      general_admin: 'Admin General',
    },
    rolePermissions: {
      user: [
        'Navegar y ver torneos',
        'Enviar solicitudes a torneos',
        'Ver y gestionar tus propias solicitudes',
        'Editar tu perfil',
      ],
      club_admin: [
        'Crear y editar torneos',
        'Ver y gestionar solicitudes de torneos',
        'Inscribir a otros usuarios en torneos',
        'Crear y editar usuarios',
      ],
      federation_admin: [
        'Crear y editar torneos',
        'Eliminar torneos',
        'Ver y gestionar solicitudes de torneos',
        'Editar y eliminar solicitudes, generar PDFs',
        'Inscribir a otros usuarios en torneos',
        'Crear, editar y eliminar usuarios',
      ],
      general_admin: [
        'Acceso completo a todos los torneos y solicitudes',
        'Crear, editar y eliminar usuarios',
        'Gestionar datos de referencia (categorías, clubes, divisiones, reglas)',
        'Gestionar permisos de función (Control de Acceso)',
        'Todas las demás capacidades administrativas',
      ],
    },
  },

  clubInvitation: {
    subject: 'Estás invitado a unirte a {{clubName}}',
    heading: 'Invitación al Club',
    greeting: 'Has sido invitado a unirte a {{clubName}}.',
    body: '{{inviterName}} (Admin del Club {{clubName}}) te ha invitado a unirse a su club. Puedes aceptar esta invitación o ignorar este email.',
    ctaLabel: 'Unirse al Club',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este email con seguridad.',
  },

  clubJoined: {
    subject: 'Nuevo miembro se unió a {{clubName}}',
    heading: 'Nuevo Miembro del Club',
    greeting: 'Un nuevo miembro se ha unido a {{clubName}}.',
    body: '{{userName}} se ha unido a {{clubName}}.',
    viewProfile: 'Ver perfil: {{profileUrl}}',
  },

  clubLeft: {
    subject: 'Miembro dejó {{clubName}}',
    heading: 'Miembro del Club Se Fue',
    greeting: 'Un miembro ha dejado {{clubName}}.',
    body: '{{userName}} ha dejado {{clubName}}.',
    viewProfile: 'Ver perfil: {{profileUrl}}',
  },

  federationInvitation: {
    subject: '{{federationName}} invita a tu club a unirse',
    heading: 'Invitación a la Federación',
    greeting: '{{federationName}} ha invitado a tu club a unirse.',
    body: '{{inviterName}} (Admin de la Federación {{federationName}}) ha invitado a {{clubName}} a unirse a la federación. Puedes aceptar esta invitación o ignorar este email.',
    ctaLabel: 'Aceptar Invitación',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este email con seguridad.',
  },

  federationClubJoined: {
    subject: '{{clubName}} se unió a {{federationName}}',
    heading: 'Club Se Unió a la Federación',
    greeting: '{{federationName}} tiene un nuevo club miembro.',
    body: '{{clubName}} se ha unido a {{federationName}}.',
  },

  federationClubRemoved: {
    subject: 'Club eliminado de {{federationName}}',
    heading: 'Club Eliminado de la Federación',
    greeting: 'Un club ha sido eliminado de {{federationName}}.',
    body: '{{clubName}} ha sido eliminado de {{federationName}} por {{removedBy}}.',
  },

  clubJoinRequestNotification: {
    subject: 'Nueva solicitud para unirse a {{clubName}}',
    heading: 'Nueva solicitud de ingreso al club',
    greeting: 'Alguien quiere unirse a {{clubName}}.',
    body: '{{requesterName}} ({{requesterEmail}}) ha solicitado unirse a {{clubName}}.',
    messageLabel: 'Mensaje:',
    reviewNote: 'Revisa y responde en Mi Club: {{reviewUrl}}',
  },

  clubJoinRequestApproved: {
    subject: 'Bienvenido a {{clubName}}',
    heading: 'Solicitud de ingreso aprobada',
    greeting: 'Hola {{name}},',
    body: 'Tu solicitud para unirte a {{clubName}} ha sido aprobada.',
    profileNote: 'Ver tu perfil: {{profileUrl}}',
  },

  clubJoinRequestRejected: {
    subject: 'Actualización sobre tu solicitud para {{clubName}}',
    heading: 'Actualización de solicitud de ingreso',
    greeting: 'Hola {{name}},',
    body: 'Tu solicitud para unirte a {{clubName}} no fue aprobada en este momento.',
    note: 'Si tienes preguntas, contacta directamente con el club.',
  },
};
