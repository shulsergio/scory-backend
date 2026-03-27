export const calculatePoints = (pHome, pAway, rHome, rAway) => {
  let basePoints = 0;

  const isExactScore = pHome === rHome && pAway === rAway;
  const isCorrectDifference = pHome - pAway === rHome - rAway;
  const isCorrectOutcome =
    Math.sign(pHome - pAway) === Math.sign(rHome - rAway);

  // схема начіслений!!!
  if (isExactScore) {
    basePoints = 5;
  } else if (isCorrectOutcome && isCorrectDifference) {
    basePoints = 3; // Включая ничьи (1:1 при 2:2)
  } else if (isCorrectOutcome) {
    basePoints = 2;
  }
  //  БЛНУС
  const isTotalCorrect = pHome + pAway === rHome + rAway;
  const totalBonus = isTotalCorrect ? 1 : 0;
  const points = basePoints + totalBonus;
  return points;
};
