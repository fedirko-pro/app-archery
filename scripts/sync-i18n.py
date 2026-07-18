#!/usr/bin/env python3
"""Sync missing i18n keys into all locale files with translations."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "apps/web/src/locales"
LANGS = ["en", "uk", "de", "es", "it", "pt"]


def flatten(d: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out


def set_path(d: dict, path: str, value: str) -> None:
    parts = path.split(".")
    cur: dict = d
    for i, p in enumerate(parts[:-1]):
        if p not in cur or not isinstance(cur[p], dict):
            # Do not overwrite an existing string leaf with an object
            if p in cur and not isinstance(cur[p], dict):
                raise TypeError(
                    f"Cannot set {path}: intermediate '{'.'.join(parts[: i + 1])}' is a string"
                )
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def load(lang: str) -> dict:
    return json.loads((LOCALES / lang / "common.json").read_text(encoding="utf-8"))


def save(lang: str, data: dict) -> None:
    path = LOCALES / lang / "common.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# English source keys to ensure exist
# ---------------------------------------------------------------------------
NEW_EN: dict[str, str] = {
    "admin.applyUser.notesPlaceholder": "Additional notes (optional)...",
    "admin.applyUser.searchPlaceholder": "Search by name or email...",
    "buttons.ok": "OK",
    "clubs.logoReady": "Logo ready — it will upload when you save",
    "common.edit": "Edit",
    "common.sending": "Sending...",
    "common.loading": "Loading...",
    "common.close": "Close",
    "forms.club": "Club",
    "forms.gender": "Gender",
    "forms.genderFemale": "Female",
    "forms.genderMale": "Male",
    "forms.genderOther": "Other",
    "forms.nationality": "Nationality",
    "forms.noClub": "No Club",
    "forms.none": "None",
    "invitations.acceptError": "Failed to accept invitation",
    "invitations.accepted": "You have joined the club!",
    "invitations.federationAccepted": "Your club has joined the federation!",
    "invitations.goToProfile": "Go to Profile",
    "invitations.invalidToken": "Invalid invitation link",
    "invitations.loginRequired": "Login Required",
    "invitations.loginToAccept": "Please sign in to accept this club invitation.",
    "invitations.loginToAcceptFederation": "Please sign in to accept this federation invitation.",
    "nav.myClub": "My Club",
    "nav.myFederation": "My Federation",
    "pages.applicationForm.gender": "Gender",
    "pages.applicationForm.nationality": "Nationality",
    "pages.applicationForm.opts.female": "Female",
    "pages.applicationForm.opts.male": "Male",
    "pages.applicationForm.opts.other": "Other",
    "pages.categories.create": "Create Category",
    "pages.categories.editTitle": "Edit category",
    "pages.categories.createTitle": "Create category",
    "pages.categories.code": "Code",
    "pages.categories.name": "Name",
    "pages.categories.rule": "Rule",
    "pages.categories.descriptionEn": "Description (EN)",
    "pages.categories.descriptionPt": "Description (PT)",
    "pages.categories.descriptionIt": "Description (IT)",
    "pages.categories.descriptionUk": "Description (UA)",
    "pages.categories.descriptionEs": "Description (ES)",
    "pages.categories.descriptionDe": "Description (DE)",
    "pages.categories.ruleCitation": "Rule citation (link text)",
    "pages.categories.loadError": "Failed to load category",
    "pages.categories.requiredFields": "Code, name, and rule are required",
    "pages.categories.saveError": "Failed to save category",
    "pages.categories.empty": 'No categories found. Click "Create Category" to add one.',
    "pages.divisions.create": "Create Division",
    "pages.divisions.createTitle": "Create Division",
    "pages.divisions.editTitle": "Edit Division",
    "pages.divisions.name": "Division Name",
    "pages.divisions.namePlaceholder": "e.g. Adult, Junior, Veteran",
    "pages.divisions.rule": "Rule",
    "pages.divisions.selectRule": "Select a rule",
    "pages.divisions.description": "Description",
    "pages.divisions.descriptionPlaceholder": "e.g. Adult archers...",
    "pages.divisions.empty": 'No divisions found. Click "Create Division" to add one.',
    "pages.divisions.noDescription": "No description available",
    "pages.tournaments.applicationDeadline": "Application Deadline",
    "pages.tournaments.applicationSubmitted": "Application submitted successfully!",
    "pages.tournaments.attachmentsReady": "{{count}} file(s) ready — they will upload when you save",
    "pages.tournaments.bannerReady": "Banner ready — it will upload when you save",
    "pages.tournaments.form.rules": "Rules",
    "pages.tournaments.form.selectRules": "Select Rules",
    "pages.tournaments.form.targetCount": "Number of Targets",
    "pages.tournaments.form.targetCountHelper": "Number of targets/patrols for the tournament",
    "pages.tournaments.noRulesAssigned": "Not specified",
    "pages.tournaments.notSpecified": "Not specified",
    "pages.tournaments.preparing": "Preparing...",
    "pages.tournaments.rules": "Rules",
    "pages.rules.codeNameRequired": "Rule code and name are required",
    "pages.rules.saveSuccess": "Rule saved successfully",
    "pages.rules.updateSuccess": "Rule updated successfully",
    "pages.rules.createSuccess": "Rule created successfully",
    "pages.rules.deleteSuccess": "Rule deleted successfully",
    "pages.rules.saveError": "Failed to save rule",
    "pages.rules.deleteError": "Failed to delete rule. It may have related divisions or bow categories.",
    "profile.clubs": "Clubs",
    "profile.confirmLeaveClub": "Are you sure you want to leave this club?",
    "profile.cropAndUse": "Crop and Use",
    "profile.invalidCrop": "Invalid crop parameters. Please try adjusting the image.",
    "profile.leaveClub": "Leave club",
    "profile.pending": "pending",
    "profile.pendingInvitation": "Invitation pending",
    "profile.unverifiedClub": "Unverified",
    "profile.verifiedClubMember": "Verified club member",
    "profile.updateError": "Failed to update profile. Please try again.",
    "reset.strengthWeak": "Weak",
    "reset.strengthFair": "Fair",
    "reset.strengthGood": "Good",
    "reset.strengthStrong": "Strong",
    "auth.receiveUpdates": "I want to receive updates via email.",
    "forgotPassword.title": "Reset password",
    "forgotPassword.body": "Enter your account's email address, and we'll send you a link to reset your password.",
    "forgotPassword.email": "Email address",
    "forgotPassword.sending": "Sending...",
    "forgotPassword.continue": "Continue",
    "forgotPassword.success": "If an account exists for that email, a reset link has been sent.",
    "forgotPassword.error": "Failed to send reset email. Please try again.",
    "forgotPassword.close": "Close",
    "auth.googleFailed": "Google authentication failed",
    "auth.googleAuthFailed": "Authentication failed",
    "auth.googleRedirecting": "Redirecting to sign in page...",
    "auth.googleCompleting": "Completing Google authentication...",
    "header.home": "Home",
    "languageToggler.label": "Language",
    "fileAttachments.delete": "Delete",
    "myClub.adminBadge": "Admin",
    "logoUploader.currentLogo": "Current logo: {{name}}",
    "logoUploader.corsPreviewUnavailable": "Preview unavailable - CORS restriction. Upload a new image to edit.",
    # Patrols
    "pages.patrols.title": "Patrol Management",
    "pages.patrols.saveChanges": "Save Changes",
    "pages.patrols.saving": "Saving...",
    "pages.patrols.generateList": "Generate patrols list",
    "pages.patrols.generateScoreCards": "Generate score cards",
    "pages.patrols.regenerate": "Regenerate",
    "pages.patrols.retry": "Retry",
    "pages.patrols.generating": "Generating...",
    "pages.patrols.generate": "Generate patrols",
    "pages.patrols.empty": "No patrols yet. Generate patrols from approved applications when you are ready.",
    "pages.patrols.confirmGenerate": "Generate patrols from approved applications? This will create new patrol assignments.",
    "pages.patrols.confirmRegenerate": "This will DELETE all existing patrols and regenerate new ones from approved applications. Continue?",
    "pages.patrols.confirmDeleteRedistribute": "Delete this patrol and redistribute its members?",
    "pages.patrols.loadError": "Failed to load patrols. Please try again.",
    "pages.patrols.saveSuccess": "Patrols saved successfully!",
    "pages.patrols.saveError": "Failed to save patrols. Please try again.",
    "pages.patrols.cannotMove": "Cannot move member",
    "pages.patrols.generateSuccess": "Patrols generated from approved applications",
    "pages.patrols.generateError": "Failed to generate patrols. Please try again.",
    "pages.patrols.openingListPdf": "Opening patrols list PDF...",
    "pages.patrols.listPdfError": "Failed to generate patrols list. Please try again.",
    "pages.patrols.openingScoreCardsPdf": "Opening score cards PDF...",
    "pages.patrols.scoreCardsPdfError": "Failed to generate score cards. Please try again.",
    "pages.patrols.deleteRedistributeSuccess": "Patrol deleted and members redistributed.",
    "pages.patrols.deleteRedistributeError": "Failed to delete patrol and redistribute members.",
    "pages.patrols.regenerateSuccess": "Patrols regenerated successfully!",
    "pages.patrols.regenerateError": "Failed to regenerate patrols",
    "pages.patrols.leader": "Leader",
    "pages.patrols.judge": "Judge",
    "pages.patrols.memberActions": "Member actions",
    "pages.patrols.makeLeader": "Make Leader",
    "pages.patrols.makeJudge": "Make Judge",
    "pages.patrols.removeRole": "Remove Role",
    "pages.patrols.moveToPatrol": "Move to patrol",
    "pages.patrols.patrolN": "Patrol {{number}}",
    "pages.patrols.patrolTitle": "PATROL {{number}}",
    "pages.patrols.membersCount": "{{count}} members",
    "pages.patrols.delete": "Delete",
    "pages.patrols.deleteTooltip": "Delete patrol and redistribute members",
    "pages.patrols.statistics": "Statistics",
    "pages.patrols.participants": "Participants",
    "pages.patrols.avgSize": "Avg Size",
    "pages.patrols.categoryMatch": "Category Match",
    "pages.patrols.clubDiversity": "Club Diversity",
    "pages.patrols.divisionMatch": "Division Match",
    "pages.patrols.genderMatch": "Gender Match",
    "pages.patrols.unknown": "Unknown",
    "pages.patrols.noClub": "No Club",
    "pages.patrols.warnings.sameClubJudges": "Judges are from the same club",
    "pages.patrols.warnings.missingJudges": "Only {{count}} judge(s) assigned",
    "pages.patrols.warnings.missingLeader": "No leader assigned",
    "pages.patrols.warnings.mixedDivisions": "Mixed divisions in patrol",
    "pages.patrols.warnings.mixedGenders": "Mixed genders in patrol",
    "pages.patrols.warnings.sizeImbalance": "Patrol size ({{count}}) differs significantly from average",
    "pages.patrols.validation.invalid": "Invalid patrol or member",
    "pages.patrols.validation.sourceTooSmall": "Source patrol would be too small (minimum 3 members required)",
    "pages.patrols.validation.divisionMismatch": "Member division ({{member}}) differs from patrol's dominant division ({{dominant}})",
    "pages.patrols.validation.genderMismatch": "Member gender differs from patrol's dominant gender",
    # Admin
    "pages.admin.panelTitle": "Admin Panel",
    "pages.admin.panelDescription": "Manage users, view profiles, and reset passwords. Only administrators can access this panel.",
    "pages.admin.usersTitle": "Users Management",
    "pages.admin.createUser": "Create User",
    "pages.admin.createUserTitle": "Create New User",
    "pages.admin.table.name": "Name",
    "pages.admin.table.email": "Email",
    "pages.admin.table.gender": "Gender",
    "pages.admin.table.club": "Club",
    "pages.admin.table.actions": "Actions",
    "pages.admin.notSet": "Not set",
    "pages.admin.fetchUsersError": "Failed to fetch users",
    "pages.admin.resetEmailSent": "Password reset email sent to {{email}}",
    "pages.admin.resetEmailFailed": "Failed to send password reset email",
    "pages.admin.createUserSuccess": "User {{name}} created successfully. They will receive an invitation email.",
    "pages.admin.createUserFailed": "Failed to create user",
    "pages.admin.viewProfile": "View Profile",
    "pages.admin.editProfile": "Edit Profile",
    "pages.admin.resetPassword": "Reset Password",
    "pages.admin.backToPanel": "Back to Admin Panel",
    "pages.admin.userNotFound": "User not found",
    "pages.admin.fetchUserError": "Failed to fetch user data",
    "pages.admin.updateUserError": "Failed to update user. Please try again.",
    "pages.admin.updateUserSuccess": "User updated successfully!",
    "pages.admin.firstName": "First Name",
    "pages.admin.lastName": "Last Name",
    "pages.admin.email": "Email",
    "pages.admin.commentOptional": "Comment (optional)",
    "pages.admin.commentPlaceholder": "Add a note about this user...",
    "pages.admin.firstNameRequired": "First name is required",
    "pages.admin.lastNameRequired": "Last name is required",
    "pages.admin.emailRequired": "Email is required",
    "pages.admin.invalidEmail": "Invalid email format",
    "pages.admin.creating": "Creating...",
    "pages.admin.createAndInvite": "Create & Invite",
}


def load_translations() -> dict[str, dict[str, str]]:
    """Load per-language overrides from companion JSON if present."""
    path = Path(__file__).with_name("i18n-translations.json")
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def main() -> int:
    translations = load_translations()

    # 1) Ensure EN has all new keys
    en = load("en")
    en_flat_before = set(flatten(en))
    for key, value in NEW_EN.items():
        set_path(en, key, value)
    save("en", en)
    en_flat = flatten(en)
    print(f"EN: added {len(set(en_flat) - en_flat_before)} new keys (total {len(en_flat)})")

    # 2) Sync each other language
    for lang in LANGS:
        if lang == "en":
            continue
        data = load(lang)
        flat = flatten(data)
        missing = sorted(set(en_flat) - set(flat))
        lang_tr = translations.get(lang, {})
        added = 0
        fallback = 0
        for key in missing:
            if key in lang_tr:
                value = lang_tr[key]
            elif key in NEW_EN and key in lang_tr:
                value = lang_tr[key]
            else:
                # Prefer translation pack; otherwise fall back to EN and warn
                value = lang_tr.get(key, en_flat[key])
                if key not in lang_tr:
                    fallback += 1
            set_path(data, key, value)
            added += 1
        save(lang, data)
        remaining_fallback = fallback
        print(f"{lang}: added {added} keys ({remaining_fallback} still English fallback)")

    # 3) Final parity report
    en_flat = flatten(load("en"))
    print("\nParity vs EN:")
    for lang in LANGS:
        if lang == "en":
            continue
        missing = sorted(set(en_flat) - set(flatten(load(lang))))
        print(f"  {lang}: {len(missing)} missing")
    return 0


if __name__ == "__main__":
    sys.exit(main())
