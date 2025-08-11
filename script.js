document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.getElementById('answer-input');
    const verifyBtn = document.getElementById('verify-btn');
    const resultsPanel = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');
    
    // Verification options
    const checkAccuracy = document.getElementById('check-accuracy');
    const checkConsistency = document.getElementById('check-consistency');
    const checkCompleteness = document.getElementById('check-completeness');
    
    verifyBtn.addEventListener('click', function() {
        const answer = answerInput.value.trim();
        
        if (!answer) {
            showError('Please enter an answer to verify.');
            return;
        }
        
        // Show loading state
        verifyBtn.textContent = 'Verifying...';
        verifyBtn.disabled = true;
        
        // Simulate verification process
        setTimeout(() => {
            const results = performVerification(answer);
            displayResults(results);
            
            // Reset button
            verifyBtn.textContent = 'Verify Answer';
            verifyBtn.disabled = false;
        }, 1500);
    });
    
    function performVerification(answer) {
        const results = [];
        
        // Check accuracy
        if (checkAccuracy.checked) {
            const accuracyScore = analyzeAccuracy(answer);
            results.push({
                type: 'accuracy',
                status: accuracyScore > 0.7 ? 'success' : accuracyScore > 0.5 ? 'warning' : 'error',
                message: `Accuracy Score: ${(accuracyScore * 100).toFixed(1)}%`,
                details: getAccuracyDetails(accuracyScore)
            });
        }
        
        // Check consistency
        if (checkConsistency.checked) {
            const consistencyScore = analyzeConsistency(answer);
            results.push({
                type: 'consistency',
                status: consistencyScore > 0.8 ? 'success' : consistencyScore > 0.6 ? 'warning' : 'error',
                message: `Consistency Score: ${(consistencyScore * 100).toFixed(1)}%`,
                details: getConsistencyDetails(consistencyScore)
            });
        }
        
        // Check completeness
        if (checkCompleteness.checked) {
            const completenessScore = analyzeCompleteness(answer);
            results.push({
                type: 'completeness',
                status: completenessScore > 0.75 ? 'success' : completenessScore > 0.5 ? 'warning' : 'error',
                message: `Completeness Score: ${(completenessScore * 100).toFixed(1)}%`,
                details: getCompletenessDetails(completenessScore)
            });
        }
        
        return results;
    }
    
    function analyzeAccuracy(answer) {
        // Simple accuracy analysis based on answer length, structure, and content
        let score = 0.5; // Base score
        
        // Length factor
        if (answer.length > 100) score += 0.2;
        if (answer.length > 300) score += 0.1;
        
        // Structure factor
        if (answer.includes('.') && answer.includes(',')) score += 0.1;
        if (answer.includes('because') || answer.includes('therefore')) score += 0.1;
        
        // Content quality indicators
        if (answer.match(/[A-Z][a-z]+/g)?.length > 3) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    function analyzeConsistency(answer) {
        // Simple consistency analysis
        let score = 0.6; // Base score
        
        // Check for contradictory statements
        const contradictions = [
            ['yes', 'no'],
            ['always', 'never'],
            ['true', 'false']
        ];
        
        let hasContradictions = false;
        contradictions.forEach(([word1, word2]) => {
            if (answer.toLowerCase().includes(word1) && answer.toLowerCase().includes(word2)) {
                hasContradictions = true;
            }
        });
        
        if (!hasContradictions) score += 0.3;
        
        // Check for consistent terminology
        const words = answer.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words);
        if (uniqueWords.size / words.length > 0.7) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    function analyzeCompleteness(answer) {
        // Simple completeness analysis
        let score = 0.5; // Base score
        
        // Length factor
        if (answer.length > 150) score += 0.2;
        if (answer.length > 400) score += 0.2;
        
        // Structure indicators
        if (answer.includes('1.') || answer.includes('•')) score += 0.1;
        if (answer.includes('example') || answer.includes('instance')) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    function getAccuracyDetails(score) {
        if (score > 0.8) return "Excellent accuracy with well-structured content";
        if (score > 0.6) return "Good accuracy with room for improvement";
        return "Accuracy needs improvement - consider adding more detail and structure";
    }
    
    function getConsistencyDetails(score) {
        if (score > 0.8) return "Highly consistent with no contradictions";
        if (score > 0.6) return "Generally consistent with minor issues";
        return "Inconsistencies detected - review for contradictions";
    }
    
    function getCompletenessDetails(score) {
        if (score > 0.8) return "Comprehensive and well-rounded answer";
        if (score > 0.6) return "Good coverage with some areas for expansion";
        return "Answer could be more complete - consider adding examples and details";
    }
    
    function displayResults(results) {
        resultsContent.innerHTML = '';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.status}`;
            
            const icon = document.createElement('div');
            icon.className = `result-icon ${result.status}`;
            icon.textContent = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
            
            const content = document.createElement('div');
            content.innerHTML = `
                <strong>${result.message}</strong><br>
                <small>${result.details}</small>
            `;
            
            resultItem.appendChild(icon);
            resultItem.appendChild(content);
            resultsContent.appendChild(resultItem);
        });
        
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    function showError(message) {
        resultsContent.innerHTML = `
            <div class="result-item error">
                <div class="result-icon error">✗</div>
                <div><strong>Error:</strong> ${message}</div>
            </div>
        `;
        resultsPanel.style.display = 'block';
    }
    
    // Add some sample data for demonstration
    answerInput.addEventListener('focus', function() {
        if (!answerInput.value) {
            answerInput.placeholder = 'Example: The answer to this question is that machine learning algorithms require sufficient training data to perform well. This is because the model needs to learn patterns from examples, and without enough data, it may overfit or fail to generalize to new situations.';
        }
    });
});
