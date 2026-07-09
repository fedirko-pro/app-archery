import type { EmailI18n } from './types';

export const pt: EmailI18n = {
  footer: 'Este é um e-mail automático. Por favor, não responda a esta mensagem.',

  passwordReset: {
    subject: 'Pedido de redefinição de senha',
    heading: 'Pedido de Redefinição de Senha',
    hello: 'Olá,',
    body: 'Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para definir uma nova senha:',
    ctaLabel: 'Redefinir Senha',
    linkFallback: 'Se o botão não funcionar, pode copiar e colar este link no seu navegador:',
    expiry: 'Este link expirará em 1 hora por razões de segurança.',
    ignoreNote: 'Se não solicitou esta redefinição de senha, por favor ignore este e-mail.',
  },

  welcome: {
    subject: 'Bem-vindo(a) à Archery App!',
    heading: 'Bem-vindo(a) à Archery App!',
    greeting: 'Olá {{name}},',
    intro:
      'Obrigado(a) por se juntar à nossa comunidade de tiro com arco! Estamos entusiasmados por tê-lo(a) connosco.',
    features: [
      'Complete o seu perfil',
      'Participe em competições',
      'Acompanhe o seu progresso',
      'Conecte-se com outros arqueiros',
    ],
    helpNote: 'Se tiver alguma dúvida, não hesite em contactar a nossa equipa de suporte.',
  },

  invitation: {
    subject: 'Está convidado(a) para a Archery App',
    heading: 'Está Convidado(a) para a Archery App',
    body: '{{adminName}} criou uma conta para você na Archery App. Clique no botão abaixo para definir a sua senha e começar:',
    ctaLabel: 'Definir Senha',
    linkFallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    expiry: 'Este link expirará em 24 horas.',
    ignoreNote: 'Se não estava a esperar este convite, pode ignorar este e-mail com segurança.',
  },

  applicationSubmitted: {
    subject: 'Candidatura Submetida – {{tournamentTitle}}',
    heading: 'Candidatura Submetida',
    greeting: 'Olá {{name}},',
    successMessage: 'A sua candidatura para {{tournamentTitle}} foi submetida com sucesso.',
    labelTournament: 'Torneio',
    labelDate: 'Data',
    labelLocation: 'Local',
    waitMessage:
      'Por favor, aguarde enquanto o administrador analisa a sua candidatura. Receberá outro e-mail assim que uma decisão for tomada.',
    ctaLabel: 'Ver as Minhas Candidaturas',
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Candidatura Aprovada – {{tournamentTitle}}',
    subjectRejected: 'Atualização de Candidatura – {{tournamentTitle}}',
    headingApproved: 'Candidatura ao Torneio Aprovada ✓',
    headingUpdate: 'Atualização de Candidatura ao Torneio',
    greeting: 'Olá {{name}},',
    approvedMessage: 'Ótimas notícias! A sua candidatura para {{tournamentTitle}} foi aprovada.',
    approvedDetail:
      'Está agora inscrito(a) neste torneio. Por favor, verifique os detalhes da sua candidatura e prepare-se para a competição.',
    approvedLookForward: 'Esperamos vê-lo(a) lá!',
    rejectedMessage: 'A sua candidatura para {{tournamentTitle}} foi analisada.',
    feedbackLabel: 'Feedback:',
    questionsNote: 'Se tiver alguma dúvida ou preocupação, não hesite em contactar-nos.',
    ctaLabel: 'Ver as Minhas Candidaturas',
  },

  roleChanged: {
    subject: 'A sua função foi atualizada – Archery App',
    heading: 'A Sua Função Foi Atualizada',
    greeting: 'Olá {{name}},',
    body: '{{adminName}} atualizou a sua função na Archery App:',
    permissionsHeading: 'Com a função {{role}} pode:',
    questionsNote:
      'Se tiver alguma dúvida sobre as suas novas permissões, contacte o seu administrador.',
    ctaLabel: 'Ver o Meu Perfil',
    roleLabels: {
      user: 'Utilizador',
      club_admin: 'Admin de Clube',
      federation_admin: 'Admin de Federação',
      general_admin: 'Admin Geral',
    },
    rolePermissions: {
      user: [
        'Navegar e visualizar torneios',
        'Submeter candidaturas a torneios',
        'Visualizar e gerir as suas próprias candidaturas',
        'Editar o seu perfil',
      ],
      club_admin: [
        'Criar e editar torneios',
        'Visualizar e gerir candidaturas a torneios',
        'Inscrever outros utilizadores em torneios',
        'Criar e editar utilizadores',
      ],
      federation_admin: [
        'Criar e editar torneios',
        'Eliminar torneios',
        'Visualizar e gerir candidaturas a torneios',
        'Editar e eliminar candidaturas, gerar PDFs',
        'Inscrever outros utilizadores em torneios',
        'Criar, editar e eliminar utilizadores',
      ],
      general_admin: [
        'Acesso total a todos os torneios e candidaturas',
        'Criar, editar e eliminar utilizadores',
        'Gerir dados de referência (categorias, clubes, divisões, regras)',
        'Gerir permissões de função (Controlo de Acesso)',
        'Todas as outras capacidades de administração',
      ],
    },
  },

  clubInvitation: {
    subject: 'Foi convidado a juntar-se a {{clubName}}',
    heading: 'Convite para Clube',
    greeting: 'Foi convidado a juntar-se a {{clubName}}.',
    body: '{{inviterName}} (Admin do Clube {{clubName}}) convidou-o a juntar-se ao seu clube. Pode aceitar este convite ou ignorar este email.',
    ctaLabel: 'Juntar-se ao Clube',
    linkFallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    ignoreNote: 'Se não estava à espera deste convite, pode ignorar este email com segurança.',
  },

  clubJoined: {
    subject: 'Novo membro juntou-se a {{clubName}}',
    heading: 'Novo Membro do Clube',
    greeting: 'Um novo membro juntou-se a {{clubName}}.',
    body: '{{userName}} juntou-se a {{clubName}}.',
    viewProfile: 'Ver perfil: {{profileUrl}}',
  },

  clubLeft: {
    subject: 'Membro deixou {{clubName}}',
    heading: 'Membro do Clube Saiu',
    greeting: 'Um membro deixou {{clubName}}.',
    body: '{{userName}} deixou {{clubName}}.',
    viewProfile: 'Ver perfil: {{profileUrl}}',
  },

  federationInvitation: {
    subject: '{{federationName}} convida o seu clube a juntar-se',
    heading: 'Convite para Federação',
    greeting: '{{federationName}} convidou o seu clube a juntar-se.',
    body: '{{inviterName}} (Admin da Federação {{federationName}}) convidou {{clubName}} a juntar-se à federação. Pode aceitar este convite ou ignorar este email.',
    ctaLabel: 'Aceitar Convite',
    linkFallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    ignoreNote: 'Se não estava à espera deste convite, pode ignorar este email com segurança.',
  },

  federationClubJoined: {
    subject: '{{clubName}} juntou-se a {{federationName}}',
    heading: 'Clube Juntou-se à Federação',
    greeting: '{{federationName}} tem um novo clube membro.',
    body: '{{clubName}} juntou-se a {{federationName}}.',
  },

  federationClubRemoved: {
    subject: 'Clube removido de {{federationName}}',
    heading: 'Clube Removido da Federação',
    greeting: 'Um clube foi removido de {{federationName}}.',
    body: '{{clubName}} foi removido de {{federationName}} por {{removedBy}}.',
  },

  clubJoinRequestNotification: {
    subject: 'Novo pedido para entrar em {{clubName}}',
    heading: 'Novo pedido de adesão ao clube',
    greeting: 'Alguém quer entrar em {{clubName}}.',
    body: '{{requesterName}} ({{requesterEmail}}) pediu para entrar em {{clubName}}.',
    messageLabel: 'Mensagem:',
    reviewNote: 'Reveja e responda em O meu clube: {{reviewUrl}}',
  },

  clubJoinRequestApproved: {
    subject: 'Bem-vindo a {{clubName}}',
    heading: 'Pedido de adesão aprovado',
    greeting: 'Olá {{name}},',
    body: 'O seu pedido para entrar em {{clubName}} foi aprovado.',
    profileNote: 'Ver o seu perfil: {{profileUrl}}',
  },

  clubJoinRequestRejected: {
    subject: 'Atualização sobre o pedido para {{clubName}}',
    heading: 'Atualização do pedido de adesão',
    greeting: 'Olá {{name}},',
    body: 'O seu pedido para entrar em {{clubName}} não foi aprovado neste momento.',
    note: 'Se tiver dúvidas, contacte o clube diretamente.',
  },
};
