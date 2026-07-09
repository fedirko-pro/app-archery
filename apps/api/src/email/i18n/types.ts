export interface EmailI18n {
  footer: string;

  passwordReset: {
    subject: string;
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
    heading: string;
    greeting: string; // supports {{name}}
    intro: string;
    features: [string, string, string, string];
    helpNote: string;
  };

  invitation: {
    subject: string;
    heading: string;
    body: string; // supports {{adminName}}
    ctaLabel: string;
    linkFallback: string;
    expiry: string;
    ignoreNote: string;
  };

  applicationSubmitted: {
    subject: string; // supports {{tournamentTitle}}
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
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{inviterName}}, {{clubName}}
    ctaLabel: string;
    linkFallback: string;
    ignoreNote: string;
  };

  clubJoined: {
    subject: string;
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{userName}}, {{clubName}}
    viewProfile: string; // supports {{profileUrl}}
  };

  clubLeft: {
    subject: string;
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{userName}}, {{clubName}}
    viewProfile: string; // supports {{profileUrl}}
  };

  federationInvitation: {
    subject: string;
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{inviterName}}, {{federationName}}, {{clubName}}
    ctaLabel: string;
    linkFallback: string;
    ignoreNote: string;
  };

  federationClubJoined: {
    subject: string;
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{clubName}}, {{federationName}}
  };

  federationClubRemoved: {
    subject: string;
    heading: string;
    greeting: string; // supports {{federationName}}
    body: string; // supports {{clubName}}, {{federationName}}, {{removedBy}}
  };

  clubJoinRequestNotification: {
    subject: string;
    heading: string;
    greeting: string; // supports {{clubName}}
    body: string; // supports {{requesterName}}, {{requesterEmail}}, {{clubName}}
    messageLabel: string;
    reviewNote: string; // supports {{reviewUrl}}
  };

  clubJoinRequestApproved: {
    subject: string;
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{clubName}}
    profileNote: string; // supports {{profileUrl}}
  };

  clubJoinRequestRejected: {
    subject: string;
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{clubName}}
    note: string;
  };
}
