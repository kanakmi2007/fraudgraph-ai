export interface PatternTranslation {
  humanName: string;
  humanDescription: string;
  technicalName: string;
  iconType: string;
}

export const translatePattern = (pattern: string): PatternTranslation => {
  const norm = (pattern || '').toUpperCase().replace(/\s+/g, '_');

  if (norm.includes('FAN_IN')) {
    return {
      humanName: 'Several People → One Account',
      humanDescription: 'Several people sent money to the same account within a short period.',
      technicalName: 'Fan-In Pattern',
      iconType: 'fan_in'
    };
  }
  if (norm.includes('FAN_OUT')) {
    return {
      humanName: 'One Person → Several Accounts',
      humanDescription: 'One person sent money to several accounts within a short period.',
      technicalName: 'Fan-Out Pattern',
      iconType: 'fan_out'
    };
  }
  if (norm.includes('CIRCULAR')) {
    return {
      humanName: 'Money Returned to Origin',
      humanDescription: 'Money moved through multiple accounts and eventually returned to the starting account.',
      technicalName: 'Circular Money Flow',
      iconType: 'circular'
    };
  }
  if (norm.includes('RAPID')) {
    return {
      humanName: 'Money Moved Rapidly',
      humanDescription: 'Money moved through several connected accounts within minutes.',
      technicalName: 'Rapid Movement',
      iconType: 'rapid'
    };
  }
  if (norm.includes('STRUCTURING')) {
    return {
      humanName: 'Similar Repeated Amounts',
      humanDescription: 'Multiple transactions sent with amounts just below typical reporting thresholds.',
      technicalName: 'Structuring / Smurfing',
      iconType: 'structuring'
    };
  }
  if (norm.includes('DORMANT')) {
    return {
      humanName: 'Sudden High Activity Spikes',
      humanDescription: 'A previously inactive account suddenly received and transferred high money volume.',
      technicalName: 'Dormant Account Activation',
      iconType: 'dormant'
    };
  }

  return {
    humanName: 'Unusual Transfer Activity',
    humanDescription: 'Transaction pattern deviates from standard behavioral baselines.',
    technicalName: pattern.replace(/_/g, ' '),
    iconType: 'generic'
  };
};

export const translateEvidence = (evidenceText: string): string => {
  if (!evidenceText) return 'Unusual transfer pattern detected.';
  
  if (evidenceText.includes('Fan-In')) {
    return 'Several people sent money to the same account within a short time window.';
  }
  if (evidenceText.includes('Fan-Out')) {
    return 'One person sent money to several different accounts rapidly.';
  }
  if (evidenceText.includes('Circular')) {
    return 'Money eventually returned to the account where it started.';
  }
  if (evidenceText.includes('Rapid')) {
    return 'Money moved through connected accounts within minutes.';
  }
  if (evidenceText.includes('Structuring')) {
    return 'Multiple transactions were sent with amounts just below limit thresholds.';
  }
  if (evidenceText.includes('Dormant')) {
    return 'An inactive account suddenly received and moved a high volume of money.';
  }
  if (evidenceText.includes('High Network Density')) {
    return 'This account is connected to multiple people transferring money simultaneously.';
  }
  if (evidenceText.includes('Behavioral Anomaly')) {
    return 'The automated assessment flagged a significant deviation from normal activity.';
  }

  return evidenceText;
};
