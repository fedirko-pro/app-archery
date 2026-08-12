import { EmailI18n } from './types';

export const es: EmailI18n = {
  footer:
    'Este es un correo electrónico automático de Sokil. Por favor, no respondas a este mensaje.',
  signOff: 'Un saludo,',
  teamName: 'El equipo de Sokil',
  appDescription:
    'Sokil es una plataforma de gestión de tiro con arco para clubes, federaciones y atletas.',
  supportLabel: '¿Necesitas ayuda?',
  supportAction: 'Contactar con soporte',

  passwordReset: {
    subject: 'Solicitud de restablecimiento de contraseña',
    preview: 'Restablece tu contraseña de Sokil — este enlace caduca en 1 hora.',
    heading: 'Solicitud de Restablecimiento de Contraseña',
    hello: 'Hola,',
    body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de Sokil. Haz clic en el botón de abajo para establecer una nueva contraseña:',
    ctaLabel: 'Restablecer Contraseña',
    linkFallback: 'Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 1 hora por razones de seguridad.',
    ignoreNote: 'Si no solicitaste este restablecimiento de contraseña, ignora este correo.',
  },

  welcome: {
    subject: '¡Bienvenido/a a Sokil!',
    preview: '¡Bienvenido/a a Sokil! Completa tu perfil y únete a competiciones.',
    heading: '¡Bienvenido/a a Sokil!',
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
    subject: 'Estás invitado/a a Sokil',
    preview: 'Has sido invitado/a a Sokil. Establece tu contraseña para comenzar.',
    heading: 'Estás Invitado/a a Sokil',
    body: '{{adminName}} ha creado una cuenta para ti en Sokil. Haz clic en el botón de abajo para establecer tu contraseña y comenzar:',
    ctaLabel: 'Establecer Contraseña',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 24 horas.',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este correo con seguridad.',
  },

  applicationSubmitted: {
    subject: 'Solicitud Enviada – {{tournamentTitle}}',
    preview: 'Tu solicitud para {{tournamentTitle}} ha sido enviada.',
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
    previewApproved: 'Tu solicitud para {{tournamentTitle}} ha sido aprobada.',
    previewRejected: 'Tu solicitud para {{tournamentTitle}} ha sido revisada.',
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
    subject: 'Tu función ha sido actualizada – Sokil',
    preview: 'Tu función en Sokil ha sido actualizada a {{newRole}}.',
    heading: 'Tu Función Ha Sido Actualizada',
    greeting: 'Hola {{name}},',
    body: '{{adminName}} ha actualizado tu función en Sokil:',
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
    preview: 'Has sido invitado a unirte a {{clubName}}.',
    heading: 'Invitación al Club',
    greeting: 'Has sido invitado a unirte a {{clubName}}.',
    body: '{{inviterName}} (Admin del Club {{clubName}}) te ha invitado a unirse a su club. Puedes aceptar esta invitación o ignorar este email.',
    ctaLabel: 'Unirse al Club',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este email con seguridad.',
  },

  clubJoined: {
    subject: 'Nuevo miembro se unió a {{clubName}}',
    preview: '{{userName}} se ha unido a {{clubName}}.',
    heading: 'Nuevo Miembro del Club',
    greeting: 'Un nuevo miembro se ha unido a {{clubName}}.',
    body: '{{userName}} se ha unido a {{clubName}}.',
    viewProfile: 'Ver perfil',
  },

  clubLeft: {
    subject: 'Miembro dejó {{clubName}}',
    preview: '{{userName}} ha dejado {{clubName}}.',
    heading: 'Miembro del Club Se Fue',
    greeting: 'Un miembro ha dejado {{clubName}}.',
    body: '{{userName}} ha dejado {{clubName}}.',
    viewProfile: 'Ver perfil',
  },

  federationInvitation: {
    subject: '{{federationName}} invita a tu club a unirse',
    preview: '{{federationName}} ha invitado a tu club a unirse.',
    heading: 'Invitación a la Federación',
    greeting: '{{federationName}} ha invitado a tu club a unirse.',
    body: '{{inviterName}} (Admin de la Federación {{federationName}}) ha invitado a {{clubName}} a unirse a la federación. Puedes aceptar esta invitación o ignorar este email.',
    ctaLabel: 'Aceptar Invitación',
    linkFallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    ignoreNote: 'Si no esperabas esta invitación, puedes ignorar este email con seguridad.',
  },

  federationClubJoined: {
    subject: '{{clubName}} se unió a {{federationName}}',
    preview: '{{clubName}} se ha unido a {{federationName}}.',
    heading: 'Club Se Unió a la Federación',
    greeting: '{{federationName}} tiene un nuevo club miembro.',
    body: '{{clubName}} se ha unido a {{federationName}}.',
  },

  federationClubRemoved: {
    subject: 'Club eliminado de {{federationName}}',
    preview: '{{clubName}} ha sido eliminado de {{federationName}}.',
    heading: 'Club Eliminado de la Federación',
    greeting: 'Un club ha sido eliminado de {{federationName}}.',
    body: '{{clubName}} ha sido eliminado de {{federationName}} por {{removedBy}}.',
  },

  clubJoinRequestNotification: {
    subject: 'Nueva solicitud para unirse a {{clubName}}',
    preview: '{{requesterName}} quiere unirse a {{clubName}}.',
    heading: 'Nueva solicitud de ingreso al club',
    greeting: 'Alguien quiere unirse a {{clubName}}.',
    body: '{{requesterName}} ({{requesterEmail}}) ha solicitado unirse a {{clubName}}.',
    messageLabel: 'Mensaje:',
    reviewNote: 'Revisa y responde en Mi Club',
  },

  clubJoinRequestApproved: {
    subject: 'Bienvenido a {{clubName}}',
    preview: 'Tu solicitud para unirte a {{clubName}} ha sido aprobada.',
    heading: 'Solicitud de ingreso aprobada',
    greeting: 'Hola {{name}},',
    body: 'Tu solicitud para unirte a {{clubName}} ha sido aprobada.',
    profileNote: 'Ver tu perfil',
  },

  clubJoinRequestRejected: {
    subject: 'Actualización sobre tu solicitud para {{clubName}}',
    preview: 'Tu solicitud para unirte a {{clubName}} no fue aprobada.',
    heading: 'Actualización de solicitud de ingreso',
    greeting: 'Hola {{name}},',
    body: 'Tu solicitud para unirte a {{clubName}} no fue aprobada en este momento.',
    note: 'Si tienes preguntas, contacta directamente con el club.',
  },
};
