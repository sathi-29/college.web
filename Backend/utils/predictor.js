class AdmissionPredictor {
  constructor() {
    this.weights = {
      rank: 0.4,
      category: 0.2,
      previousCutoffs: 0.3,
      seatAvailability: 0.1
    };
  }

  // Predict admission chance for a single college
  predict(college, userData) {
    const { exam, rank, category } = userData;
    
    // Find relevant cutoff
    const cutoff = this.findRelevantCutoff(college, exam, userData.course);
    
    if (!cutoff) {
      return this.calculateFallbackPrediction(college, userData);
    }

    // Calculate base score from rank
    const rankScore = this.calculateRankScore(rank, cutoff, category);
    
    // Adjust for category
    const categoryScore = this.calculateCategoryScore(category);
    
    // Consider seat availability
    const seatScore = this.calculateSeatScore(college, userData.course);
    
    // Consider previous year trends
    const trendScore = this.calculateTrendScore(college, exam, userData.course);
    
    // Calculate final score
    const finalScore = 
      rankScore * this.weights.rank +
      categoryScore * this.weights.category +
      trendScore * this.weights.previousCutoffs +
      seatScore * this.weights.seatAvailability;

    // Convert to percentage and chance category
    const percentage = Math.min(100, Math.max(0, finalScore * 100));
    const chance = this.scoreToChance(percentage);

    return {
      score: percentage,
      chance,
      confidence: this.calculateConfidence(college, cutoff),
      factors: {
        rankScore,
        categoryScore,
        trendScore,
        seatScore
      },
      cutoffInfo: {
        previousCutoff: cutoff.closingRank[category] || cutoff.closingRank.general,
        year: cutoff.year
      }
    };
  }

  // Find the most relevant cutoff data
  findRelevantCutoff(college, exam, course) {
    if (!college.cutoffs || college.cutoffs.length === 0) {
      return null;
    }

    // Filter by exam and course
    const relevantCutoffs = college.cutoffs.filter(c => 
      c.exam === exam && 
      (!course || c.course === course)
    );

    if (relevantCutoffs.length === 0) {
      return null;
    }

    // Get the most recent cutoff
    return relevantCutoffs.sort((a, b) => b.year - a.year)[0];
  }

  // Calculate score based on rank
  calculateRankScore(rank, cutoff, category) {
    const categoryCutoff = cutoff.closingRank[category] || cutoff.closingRank.general;
    
    if (!categoryCutoff) {
      return 0.5; // Default score if no cutoff data
    }

    // Normalize rank relative to cutoff
    const normalizedRank = rank / categoryCutoff;
    
    // Score decreases as rank approaches cutoff
    if (normalizedRank <= 0.5) return 1.0; // Top 50% of cutoff
    if (normalizedRank <= 0.75) return 0.8; // 50-75% of cutoff
    if (normalizedRank <= 0.9) return 0.6; // 75-90% of cutoff
    if (normalizedRank <= 1.0) return 0.4; // 90-100% of cutoff
    if (normalizedRank <= 1.2) return 0.2; // 100-120% of cutoff
    return 0.1; // Beyond 120% of cutoff
  }

  // Calculate score based on category
  calculateCategoryScore(category) {
    const categoryWeights = {
      'General': 0.7,
      'EWS': 0.8,
      'OBC': 0.9,
      'SC': 1.0,
      'ST': 1.0
    };
    
    return categoryWeights[category] || 0.7;
  }

  // Calculate score based on seat availability
  calculateSeatScore(college, course) {
    if (!college.courses || !course) {
      return 0.5;
    }

    const courseData = college.courses.find(c => c.courseName === course);
    if (!courseData || !courseData.seats) {
      return 0.5;
    }

    const totalSeats = courseData.seats.total || 100;
    
    // More seats = higher chance
    if (totalSeats > 200) return 1.0;
    if (totalSeats > 100) return 0.8;
    if (totalSeats > 50) return 0.6;
    if (totalSeats > 20) return 0.4;
    return 0.2;
  }

  // Calculate score based on cutoff trends
  calculateTrendScore(college, exam, course) {
    if (!college.cutoffs || college.cutoffs.length < 2) {
      return 0.5;
    }

    // Get cutoffs for the last 3 years
    const recentCutoffs = college.cutoffs
      .filter(c => c.exam === exam && (!course || c.course === course))
      .sort((a, b) => b.year - a.year)
      .slice(0, 3);

    if (recentCutoffs.length < 2) {
      return 0.5;
    }

    // Calculate trend (increasing or decreasing cutoff)
    let trend = 0;
    for (let i = 0; i < recentCutoffs.length - 1; i++) {
      const current = recentCutoffs[i].closingRank.general;
      const previous = recentCutoffs[i + 1].closingRank.general;
      
      if (current && previous) {
        // Lower cutoff = more competitive
        trend += (previous - current) / previous;
      }
    }

    // Normalize trend
    const avgTrend = trend / (recentCutoffs.length - 1);
    
    // Positive trend (cutoff decreasing) = lower chance
    if (avgTrend > 0.1) return 0.3; // Cutoff decreasing significantly
    if (avgTrend > 0.05) return 0.5; // Cutoff decreasing moderately
    if (avgTrend > -0.05) return 0.7; // Stable
    if (avgTrend > -0.1) return 0.9; // Cutoff increasing moderately
    return 1.0; // Cutoff increasing significantly
  }

  // Calculate confidence in prediction
  calculateConfidence(college, cutoff) {
    let confidence = 0.5;
    
    // More cutoff data = higher confidence
    if (college.cutoffs && college.cutoffs.length > 3) confidence += 0.2;
    if (college.cutoffs && college.cutoffs.length > 5) confidence += 0.1;
    
    // Recent data = higher confidence
    if (cutoff && cutoff.year >= new Date().getFullYear() - 1) confidence += 0.2;
    
    // Verified college = higher confidence
    if (college.isVerified) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  // Fallback prediction when no cutoff data
  calculateFallbackPrediction(college, userData) {
    // Use college ranking and placement as proxy
    let score = 0.5;
    
    if (college.ranking && college.ranking.nirf) {
      // Higher ranked colleges = lower chance
      const nirfRank = college.ranking.nirf.overall;
      if (nirfRank < 50) score = 0.2;
      else if (nirfRank < 100) score = 0.4;
      else if (nirfRank < 200) score = 0.6;
      else score = 0.8;
    }
    
    // Adjust for user's rank (if available)
    if (userData.rank) {
      // Assume top ranks have better chances
      if (userData.rank < 1000) score *= 1.2;
      else if (userData.rank < 10000) score *= 1.0;
      else if (userData.rank < 50000) score *= 0.8;
      else score *= 0.6;
    }
    
    const percentage = Math.min(100, Math.max(0, score * 100));
    const chance = this.scoreToChance(percentage);
    
    return {
      score: percentage,
      chance,
      confidence: 0.3, // Low confidence for fallback
      factors: {
        rankingBased: true,
        fallback: true
      }
    };
  }

  // Convert score to chance category
  scoreToChance(score) {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Low';
    return 'Very Low';
  }

  // Get personalized recommendations
  async getRecommendations(user, colleges, limit = 10) {
    const predictions = [];
    
    for (const college of colleges) {
      // Skip if user already saved this college
      if (user.savedColleges.includes(college._id)) {
        continue;
      }
      
      // Calculate prediction for each relevant course
      const collegePredictions = [];
      
      if (college.courses && user.preferences && user.preferences.preferredCourses) {
        for (const courseName of user.preferences.preferredCourses) {
          const course = college.courses.find(c => c.courseName === courseName);
          if (course) {
            // Use user's best exam score
            const bestExam = this.getBestExamScore(user, college);
            
            if (bestExam) {
              const prediction = this.predict(college, {
                exam: bestExam.examName,
                rank: bestExam.rank,
                category: user.academicInfo?.category || 'General',
                course: courseName
              });
              
              collegePredictions.push({
                course: courseName,
                prediction
              });
            }
          }
        }
      }
      
      // If no specific course predictions, calculate general prediction
      if (collegePredictions.length === 0) {
        const bestExam = this.getBestExamScore(user, college);
        
        if (bestExam) {
          const prediction = this.predict(college, {
            exam: bestExam.examName,
            rank: bestExam.rank,
            category: user.academicInfo?.category || 'General'
          });
          
          collegePredictions.push({
            course: 'Any',
            prediction
          });
        }
      }
      
      // Get best prediction for this college
      if (collegePredictions.length > 0) {
        const bestPrediction = collegePredictions.sort((a, b) => 
          b.prediction.score - a.prediction.score
        )[0];
        
        predictions.push({
          college,
          course: bestPrediction.course,
          prediction: bestPrediction.prediction,
          matchScore: this.calculateMatchScore(college, user)
        });
      }
    }
    
    // Sort by match score and prediction score
    return predictions
      .sort((a, b) => {
        // Primary sort by prediction score
        if (b.prediction.score !== a.prediction.score) {
          return b.prediction.score - a.prediction.score;
        }
        // Secondary sort by match score
        return b.matchScore - a.matchScore;
      })
      .slice(0, limit);
  }

  // Get user's best exam score relevant to college
  getBestExamScore(user, college) {
    if (!user.examScores || user.examScores.length === 0) {
      return null;
    }
    
    // Check which exams are accepted by the college
    const acceptedExams = new Set();
    if (college.cutoffs) {
      college.cutoffs.forEach(cutoff => acceptedExams.add(cutoff.exam));
    }
    
    // Find user's best score in accepted exams
    let bestScore = null;
    
    for (const examScore of user.examScores) {
      if (acceptedExams.has(examScore.examName)) {
        if (!bestScore || examScore.rank < bestScore.rank) {
          bestScore = examScore;
        }
      }
    }
    
    return bestScore;
  }

  // Calculate how well college matches user preferences
  calculateMatchScore(college, user) {
    let score = 0;
    let factors = 0;
    
    // Location match
    if (user.preferences?.preferredLocations) {
      const userLocations = user.preferences.preferredLocations.map(loc => 
        loc.state.toLowerCase()
      );
      
      if (userLocations.includes(college.location.state.toLowerCase())) {
        score += 1;
      }
      factors += 1;
    }
    
    // Course match
    if (user.preferences?.preferredCourses && college.courses) {
      const userCourses = new Set(user.preferences.preferredCourses.map(c => c.toLowerCase()));
      const collegeCourses = new Set(college.courses.map(c => c.courseName.toLowerCase()));
      
      const intersection = [...userCourses].filter(c => collegeCourses.has(c));
      if (intersection.length > 0) {
        score += 1;
      }
      factors += 1;
    }
    
    // Fee match
    if (user.preferences?.maxFees && college.courses) {
      const minFee = Math.min(...college.courses.map(c => c.fees?.totalFee || Infinity));
      if (minFee <= user.preferences.maxFees) {
        score += 1;
      }
      factors += 1;
    }
    
    // Placement match
    if (user.preferences?.minPlacement && college.placement?.averagePackage) {
      if (college.placement.averagePackage >= user.preferences.minPlacement) {
        score += 1;
      }
      factors += 1;
    }
    
    return factors > 0 ? score / factors : 0;
  }
}

module.exports = AdmissionPredictor;