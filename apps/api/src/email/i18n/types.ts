export interface EmailI18n {
  /** Footer note explaining the email is automated. */
  footer: string;
  /** Sign-off line, e.g. "Best regards,". */
  signOff: string;
  /** Sender name used in the sign-off, e.g. "The Sokil Team". */
  teamName: string;
  /** Short one-line description of the app shown in the footer. */
  appDescription: string;
  /** "Need help?" label in the footer. */
  supportLabel: string;
  /** "Contact support" label in the footer. */
  supportAction: string;

  passwordReset: {
    subject: string;
    preview: string;
    heading: string;
    hello: string;
    body: string;
    ctaLabel: string;
    linkFallback: string;
    expiry: string;
    ignoreNote: string;
  };

  welcome: {
    subject: string;
    preview: string;
    heading: string;
    greeting: string; // supports {{name}}
    intro: string;
    features: [string, string, string, string];
    helpNote: string;
  };

  invitation: {
    subject: string;
    preview: string;
    heading: string;
    body: string; // supports {{adminName}}
    ctaLabel: string;
    linkFallback: string;
    expiry: string;
    ignoreNote: string;
  };

  applicationSubmitted: {
    subject: string; // supports {{tournamentTitle}}
    preview: string; // supports {{tournamentTitle}}
    heading: string;
    greeting: string; // supports {{name}}
    successMessage: string; // supports {{tournamentTitle}}
    labelTournament: string;
    labelDate: string;
    labelLocation: string;
    waitMessage: string;
    ctaLabel: string;
    months: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
  };

  applicationStatus: {
    subjectApproved: string; // supports {{tournamentTitle}}
    subjectRejected: string; // supports {{tournamentTitle}}
    previewApproved: string; // supports {{tournamentTitle}}
    previewRejected: string; // supports {{tournamentTitle}}
    headingApproved: string;
    headingUpdate: string;
    greeting: string; // supports {{name}}
    approvedMessage: string; // supports {{tournamentTitle}}
    approvedDetail: string;
    approvedLookForward: string;
    rejectedMessage: string; // supports {{tournamentTitle}}
    feedbackLabel: string;
    questionsNote: string;
    ctaLabel: string;
  };

  roleChanged: {
    subject: string;
    preview: string; // supports {{newRole}}
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{adminName}}
    permissionsHeading: string; // supports {{role}}
    questionsNote: string;
    ctaLabel: string;
    roleLabels: Record<string, string>;
    rolePermissions: Record<string, string[]>;
  };

  clubInvitation: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{inviterName}}, {{clubName}}
    ctaLabel: string;
    linkFallback: string;
    ignoreNote: string;
  };

  clubJoined: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{userName}}, {{clubName}}
    viewProfile: string; // CTA label only; URL is appended by the template
  };

  clubLeft: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{userName}}, {{clubName}}
    viewProfile: string; // CTA label only; URL is appended by the template
  };

  federationInvitation: {
    subject: string;
    preview: string; // supports {{federationName}}
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{inviterName}}, {{federationName}}, {{clubName}}
    ctaLabel: string;
    linkFallback: string;
    ignoreNote: string;
  };

  federationClubJoined: {
    subject: string;
    preview: string; // supports {{clubName}}, {{federationName}}
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{clubName}}, {{federationName}}
  };

  federationClubRemoved: {
    subject: string;
    preview: string; // supports {{clubName}}, {{federationName}}
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{clubName}}, {{federationName}}, {{removedBy}}
  };

  clubJoinRequestNotification: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{requesterName}}, {{requesterEmail}}, {{clubName}}
    messageLabel: string;
    reviewNote: string; // CTA label only; URL is appended by the template
  };

  clubJoinRequestApproved: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{clubName}}
    profileNote: string; // CTA label only; URL is appended by the template
  };

  clubJoinRequestRejected: {
    subject: string;
    preview: string; // supports {{clubName}}
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{clubName}}
    note: string;
  };
}
