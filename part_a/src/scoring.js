// ===================== SCORING =====================

function calculateScore(issues, views) {
  // Weighted scoring system
  const weights = {
    MUST: 3,
    SHOULD: 1.5,
    MAY: 0.5,
    INFO: 0
  };

  const categoryWeights = {
    Completeness: 30,  // 30% — did they include required views?
    CrossLayer: 25,    // 25% — are cross-layer relationships valid?
    ArchiMate: 25,     // 25% — correct ArchiMate usage?
    SebTreb: 15,       // 15% — styling guidelines
    Assessment: 5,     // 5%  — assessment-specific criteria
  };

  // Max penalty per category
  const categoryMaxPenalty = {
    Completeness: 30,
    CrossLayer: 25,
    ArchiMate: 25,
    SebTreb: 15,
    Assessment: 5,
  };

  const penaltyByCategory = {};
  Object.keys(categoryWeights).forEach(cat => { penaltyByCategory[cat] = 0; });

  issues.forEach(issue => {
    const w = weights[issue.severity] || 0;
    const cat = issue.category;
    penaltyByCategory[cat] = (penaltyByCategory[cat] || 0) + w;
  });

  // Score per category (0-100, then weighted)
  let totalScore = 0;
  const catScores = {};

  Object.entries(categoryWeights).forEach(([cat, weight]) => {
    const penalty = penaltyByCategory[cat] || 0;
    const maxPenalty = categoryMaxPenalty[cat];
    // Diminishing penalty — first few issues hurt more
    const normalizedPenalty = Math.min(penalty / (maxPenalty * 0.5), 1);
    const catScore = Math.round((1 - normalizedPenalty) * 100);
    catScores[cat] = Math.max(0, catScore);
    totalScore += catScore * (weight / 100);
  });

  return { total: Math.round(totalScore), byCategory: catScores };
}

