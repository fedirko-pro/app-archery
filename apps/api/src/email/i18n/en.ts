import type { EmailI18n } from './types';

export const en: EmailI18n = {
  footer: 'This is an automated email. Please do not reply to this message.',

  passwordReset: {
    subject: 'Password Reset Request',
    heading: 'Password Reset Request',
    hello: 'Hello,',
    body: 'We received a request to reset the password for your account. Click the button below to set a new password:',
    ctaLabel: 'Reset Password',
    linkFallback: "If the button doesn't work, you can copy and paste this link into your browser:",
    expiry: 'This link will expire in 1 hour for security reasons.',
    ignoreNote: "If you didn't request this password reset, please ignore this email.",
  },

  welcome: {
    subject: 'Welcome to Archery App!',
    heading: 'Welcome to Archery App!',
    greeting: 'Hello {{name}},',
    intro: "Thank you for joining our archery community! We're excited to have you on board.",
    features: [
      'Complete your profile',
      'Join competitions',
      'Track your progress',
      'Connect with other archers',
    ],
    helpNote: 'If you have any questions, feel free to reach out to our support team.',
  },

  invitation: {
    subject: "You're Invited to Archery App",
    heading: "You're Invited to Archery App",
    body: '{{adminName}} has created an account for you on Archery App. Click the button below to set your password and get started:',
    ctaLabel: 'Set Your Password',
    linkFallback: "If the button doesn't work, copy and paste this link into your browser:",
    expiry: 'This link will expire in 24 hours.',
    ignoreNote: 'If you were not expecting this invitation, you can safely ignore this email.',
  },

  applicationSubmitted: {
    subject: 'Application Submitted – {{tournamentTitle}}',
    heading: 'Application Submitted',
    greeting: 'Hello {{name}},',
    successMessage: 'Your application for {{tournamentTitle}} has been successfully submitted.',
    labelTournament: 'Tournament',
    labelDate: 'Date',
    labelLocation: 'Location',
    waitMessage:
      'Please wait while the administrator reviews your application. You will receive another email once a decision has been made.',
    ctaLabel: 'View My Applications',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Application Approved – {{tournamentTitle}}',
    subjectRejected: 'Application Update – {{tournamentTitle}}',
    headingApproved: 'Tournament Application Approved ✓',
    headingUpdate: 'Tournament Application Update',
    greeting: 'Hello {{name}},',
    approvedMessage: 'Great news! Your application for {{tournamentTitle}} has been approved.',
    approvedDetail:
      'You are now registered for this tournament. Please check your application details and prepare for the competition.',
    approvedLookForward: 'We look forward to seeing you there!',
    rejectedMessage: 'Your application for {{tournamentTitle}} has been reviewed.',
    feedbackLabel: 'Feedback:',
    questionsNote: "If you have any questions or concerns, please don't hesitate to contact us.",
    ctaLabel: 'View My Applications',
  },

  roleChanged: {
    subject: 'Your Role Has Been Updated – Archery App',
    heading: 'Your Role Has Been Updated',
    greeting: 'Hello {{name}},',
    body: '{{adminName}} has updated your role in Archery App:',
    permissionsHeading: 'With the {{role}} role you can:',
    questionsNote:
      'If you have any questions about your new permissions, please contact your administrator.',
    ctaLabel: 'View My Profile',
    roleLabels: {
      user: 'User',
      club_admin: 'Club Admin',
      federation_admin: 'Federation Admin',
      general_admin: 'General Admin',
    },
    rolePermissions: {
      user: [
        'Browse and view tournaments',
        'Submit applications to tournaments',
        'View and manage your own applications',
        'Edit your profile',
      ],
      club_admin: [
        'Create and edit tournaments',
        'View and manage tournament applications',
        'Apply other users to tournaments',
        'Create and edit users',
      ],
      federation_admin: [
        'Create and edit tournaments',
        'Delete tournaments',
        'View and manage tournament applications',
        'Edit and delete applications, generate PDFs',
        'Apply other users to tournaments',
        'Create, edit and delete users',
      ],
      general_admin: [
        'Full access to all tournaments and applications',
        'Create, edit and delete users',
        'Manage reference data (categories, clubs, divisions, rules)',
        'Manage role permissions (Access Control)',
        'All other admin capabilities',
      ],
    },
  },

  clubInvitation: {
    subject: 'You are invited to join {{clubName}}',
    heading: 'Club Invitation',
    greeting: 'You have been invited to join {{clubName}}.',
    body: '{{inviterName}} (Club Admin of {{clubName}}) has invited you to join their club. You can accept this invitation or ignore this email.',
    ctaLabel: 'Join Club',
    linkFallback: "If the button doesn't work, copy and paste this link into your browser:",
    ignoreNote: 'If you were not expecting this invitation, you can safely ignore this email.',
  },

  clubJoined: {
    subject: 'New member joined {{clubName}}',
    heading: 'New Club Member',
    greeting: 'A new member has joined {{clubName}}.',
    body: '{{userName}} has joined {{clubName}}.',
    viewProfile: 'View profile: {{profileUrl}}',
  },

  clubLeft: {
    subject: 'Member left {{clubName}}',
    heading: 'Club Member Left',
    greeting: 'A member has left {{clubName}}.',
    body: '{{userName}} has left {{clubName}}.',
    viewProfile: 'View profile: {{profileUrl}}',
  },

  federationInvitation: {
    subject: '{{federationName}} invites your club to join',
    heading: 'Federation Invitation',
    greeting: '{{federationName}} has invited your club to join.',
    body: '{{inviterName}} (Federation Admin of {{federationName}}) has invited {{clubName}} to join the federation. You can accept this invitation or ignore this email.',
    ctaLabel: 'Accept Invitation',
    linkFallback: "If the button doesn't work, copy and paste this link into your browser:",
    ignoreNote: 'If you were not expecting this invitation, you can safely ignore this email.',
  },

  federationClubJoined: {
    subject: '{{clubName}} joined {{federationName}}',
    heading: 'Club Joined Federation',
    greeting: '{{federationName}} has a new member club.',
    body: '{{clubName}} has joined {{federationName}}.',
  },

  federationClubRemoved: {
    subject: 'Club removed from {{federationName}}',
    heading: 'Club Removed from Federation',
    greeting: 'A club has been removed from {{federationName}}.',
    body: '{{clubName}} has been removed from {{federationName}} by {{removedBy}}.',
  },

  clubJoinRequestNotification: {
    subject: 'New join request for {{clubName}}',
    heading: 'New Club Join Request',
    greeting: 'Someone wants to join {{clubName}}.',
    body: '{{requesterName}} ({{requesterEmail}}) has requested to join {{clubName}}.',
    messageLabel: 'Message:',
    reviewNote: 'Review and respond in My Club: {{reviewUrl}}',
  },

  clubJoinRequestApproved: {
    subject: 'Welcome to {{clubName}}',
    heading: 'Club Join Request Approved',
    greeting: 'Hello {{name}},',
    body: 'Your request to join {{clubName}} has been approved.',
    profileNote: 'View your profile: {{profileUrl}}',
  },

  clubJoinRequestRejected: {
    subject: 'Update on your {{clubName}} join request',
    heading: 'Club Join Request Update',
    greeting: 'Hello {{name}},',
    body: 'Your request to join {{clubName}} was not approved at this time.',
    note: 'If you have questions, please contact the club directly.',
  },
};
