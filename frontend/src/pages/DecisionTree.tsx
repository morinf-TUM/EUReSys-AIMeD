import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, TextField, AlertTitle, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, HelpOutline, Search } from '@mui/icons-material';
import apiService from '../services/api';
import { RegulatoryQuestion, RegulatoryAnswer } from '../types/regulatory';

const DecisionTree: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<RegulatoryQuestion[]>([]);
  const [answers, setAnswers] = useState<RegulatoryAnswer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch questions for all steps
        const allQuestions: RegulatoryQuestion[] = [];
        for (let step = 1; step <= 5; step++) {
          const response = await apiService.getRegulatoryQuestions(step);
          if (response.success && response.data) {
            allQuestions.push(...response.data);
          }
        }
        
        setQuestions(allQuestions);
      } catch (err) {
        setError('Failed to load decision tree questions. Please try again.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllQuestions();
  }, []);

  const handleAnswerChange = (questionId: string, answer: string | boolean | number) => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      
      if (existingAnswerIndex >= 0) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          answer
        };
        return updatedAnswers;
      } else {
        return [...prevAnswers, {
          questionId,
          answer
        }];
      }
    });
  };

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleSubmitAll = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.submitRegulatoryAnswers('temp-profile-id', answers);
      
      if (response.success) {
        navigate('/profiles');
      } else {
        setError(response.error || 'Failed to submit answers');
      }
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
      console.error('Error submitting answers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Interactive Decision Tree
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Navigate through the regulatory decision tree to understand how your AI medical device is classified
        under MDR, AI Act, and GDPR. Explore questions, provide answers, and see the classification logic.
      </Typography>

      <Alert severity="info" icon={<HelpOutline />} sx={{ mb: 3 }}>
        <AlertTitle>How to Use</AlertTitle>
        Expand the tree to explore regulatory questions. Click on any question to see details and provide your answer.
        The system will guide you through the classification process based on your responses.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" paragraph>
          Found {filteredQuestions.length} of {questions.length} questions
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map(question => (
              <Box key={question.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {question.reference}
                </Typography>
                <Typography variant="body2" paragraph>
                  {question.text}
                </Typography>
                {question.helpText && (
                  <Typography variant="caption" color="text.secondary" paragraph>
                    {question.helpText}
                  </Typography>
                )}
                {question.answerType === 'boolean' && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button
                      variant={answers.find(a => a.questionId === question.id)?.answer === true ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleAnswerChange(question.id, true)}
                      disabled={loading}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={answers.find(a => a.questionId === question.id)?.answer === false ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleAnswerChange(question.id, false)}
                      disabled={loading}
                    >
                      No
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/scoping')}
          disabled={loading}
        >
          Back to Scoping
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmitAll}
          disabled={loading || answers.length === 0}
          endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {loading ? 'Submitting...' : 'Submit All Answers'}
        </Button>
      </Box>

      <Alert severity="info" icon={<HelpOutline />} sx={{ mt: 3 }}>
        <AlertTitle>Need Help?</AlertTitle>
        Consult our <Link href="/help" component="a">Help Center</Link> for detailed explanations of each question
        and regulatory reference. You can also access the full text of regulations in our <Link href="/sources" component="a">Regulatory Sources</Link> section.
      </Alert>
    </Box>
  );
};

export default DecisionTree;