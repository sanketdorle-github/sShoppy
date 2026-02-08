const matchFAQ = (message, faqs) => {
  message = message.toLowerCase();

  let bestMatch = null;
  let maxScore = 0;

  for (let faq of faqs) {
    let score = 0;

    faq.keywords.forEach((keyword) => {
      if (message.includes(keyword.toLowerCase())) {
        score++;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  return maxScore > 0 ? bestMatch : null;
};

export default matchFAQ;
