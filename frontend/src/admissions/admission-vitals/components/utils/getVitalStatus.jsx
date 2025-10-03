export function getVitalStatus(vital, type, age) {
    const ranges = {
      temperature: { normal: [36.1, 37.2], warning: [37.3, 38.0], critical: [38.1, 42] },
      heart_rate: {
        normal: age <= 1 ? [100, 160] : age <= 5 ? [90, 140] : [70, 120],
        warning: age <= 1 ? [80, 180] : age <= 5 ? [70, 160] : [60, 140],
      },
      respiratory_rate: {
        normal: age <= 1 ? [30, 60] : age <= 5 ? [20, 30] : [15, 25],
        warning: age <= 1 ? [25, 70] : age <= 5 ? [15, 35] : [12, 30],
      },
      oxygen_saturation: { normal: [95, 100], warning: [90, 94], critical: [0, 89] },
      systolic: { normal: age <= 1 ? [70, 100] : age <= 5 ? [80, 110] : [90, 120] },
      pain_score: { normal: [0, 3], warning: [4, 6], critical: [7, 10] },
    };
  
    const range = ranges[type];
    if (!range || vital == null) return 'normal';
  
    if (range.critical && vital >= range.critical[0] && vital <= range.critical[1]) return 'critical';
    if (range.warning && vital >= range.warning[0] && vital <= range.warning[1]) return 'warning';
    if (vital >= range.normal[0] && vital <= range.normal[1]) return 'normal';
    return 'warning';
  }