import React from 'react';
import LegalScreen from '@/components/LegalScreen';

const SECTIONS = [
  {
    heading: '1. What We Collect',
    paragraphs: [
      'Account information: your name, email address, and a securely stored password (stored only as an irreversible hash).',
      'Content you create: chat messages, bookmarks, highlights, notes, game scores, and achievement progress, so that the app can show them back to you across sessions.',
      'Preferences: settings such as your preferred Bible version and language, stored on your device.',
    ],
  },
  {
    heading: '2. How We Use Your Information',
    paragraphs: [
      'To provide the service: your chat messages are sent to our AI provider (OpenRouter) so the assistant can respond, and your questions are processed by the Bible API to return Scripture text.',
      'To improve reliability: we log basic server errors to diagnose problems.',
      'We do not sell your personal information, and we do not use your content for advertising.',
    ],
  },
  {
    heading: '3. Third-Party Services',
    paragraphs: [
      'Scripture AI relies on carefully chosen third parties to operate: OpenRouter (AI responses), a public-domain Bible text service (Scripture passages), and standard hosting infrastructure. Each processes only the data needed to provide its part of the service.',
    ],
  },
  {
    heading: '4. Data Storage & Security',
    paragraphs: [
      'Accounts and content are stored in a database protected by industry-standard measures. Authentication uses JSON Web Tokens; your session token is kept in your device\'s secure storage, not in plain files.',
    ],
  },
  {
    heading: '5. Your Choices',
    paragraphs: [
      'You can delete chat sessions from the History tab and remove bookmarks or highlights at any time. You can also delete your account data by contacting us at the email below.',
    ],
  },
  {
    heading: '6. Children\'s Privacy',
    paragraphs: [
      'Scripture AI is not directed at children under 13, and we do not knowingly collect personal information from them.',
    ],
  },
  {
    heading: '7. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. Material changes will be communicated in the app or by email when possible.',
    ],
  },
  {
    heading: '8. Contact',
    paragraphs: [
      'For privacy questions or data requests, contact us at getscriptureai@gmail.com.',
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <LegalScreen
      title="Privacy Policy"
      updated="October 2026"
      intro="Your trust matters to us. This policy explains what Scripture AI collects, why, and the choices you have."
      sections={SECTIONS}
    />
  );
}
