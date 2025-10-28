import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Confetti from "react-confetti";

interface QuizQuestion {
  id: string;
  question: { en: string; pl: string };
  options: Array<{
    id: string;
    label: { en: string; pl: string };
    value: string;
    image?: string;
    scentProfile: string[];
  }>;
}

interface QuizResult {
  productId: string;
  name: { en: string; pl: string };
  score: number;
  image: string;
  description: { en: string; pl: string };
}

const ScentQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const questions: QuizQuestion[] = [
    {
      id: "season",
      question: {
        en: "What's your favorite season?",
        pl: "Jaka jest Twoja ulubiona pora roku?"
      },
      options: [
        {
          id: "spring",
          label: { en: "Spring", pl: "Wiosna" },
          value: "spring",
          image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=200&fit=crop",
          scentProfile: ["floral", "fresh", "light"]
        },
        {
          id: "summer",
          label: { en: "Summer", pl: "Lato" },
          value: "summer",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
          scentProfile: ["citrus", "fresh", "ocean"]
        },
        {
          id: "autumn",
          label: { en: "Autumn", pl: "Jesień" },
          value: "autumn",
          image: "https://images.unsplash.com/photo-1507371341162-763b5e419408?w=300&h=200&fit=crop",
          scentProfile: ["woody", "spicy", "warm"]
        },
        {
          id: "winter",
          label: { en: "Winter", pl: "Zima" },
          value: "winter",
          image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=300&h=200&fit=crop",
          scentProfile: ["warm", "cozy", "spicy"]
        }
      ]
    },
    {
      id: "ambiance",
      question: {
        en: "Choose your ideal ambiance:",
        pl: "Wybierz idealną atmosferę:"
      },
      options: [
        {
          id: "relaxing",
          label: { en: "Relaxing & Calm", pl: "Relaksująca i Spokojna" },
          value: "relaxing",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop",
          scentProfile: ["lavender", "vanilla", "calming"]
        },
        {
          id: "energizing",
          label: { en: "Energizing & Fresh", pl: "Energetyczna i Świeża" },
          value: "energizing",
          image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop",
          scentProfile: ["citrus", "mint", "fresh"]
        },
        {
          id: "romantic",
          label: { en: "Romantic & Warm", pl: "Romantyczna i Ciepła" },
          value: "romantic",
          image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=200&fit=crop",
          scentProfile: ["rose", "vanilla", "warm"]
        },
        {
          id: "meditative",
          label: { en: "Meditative & Zen", pl: "Medytacyjna i Zen" },
          value: "meditative",
          image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop",
          scentProfile: ["sandalwood", "incense", "earthy"]
        }
      ]
    },
    {
      id: "scent-family",
      question: {
        en: "Preferred scent family:",
        pl: "Preferowana rodzina zapachów:"
      },
      options: [
        {
          id: "floral",
          label: { en: "Floral", pl: "Kwiatowe" },
          value: "floral",
          scentProfile: ["rose", "jasmine", "lavender", "floral"]
        },
        {
          id: "woody",
          label: { en: "Woody", pl: "Drzewne" },
          value: "woody",
          scentProfile: ["sandalwood", "cedar", "woody", "earthy"]
        },
        {
          id: "fresh",
          label: { en: "Fresh", pl: "Świeże" },
          value: "fresh",
          scentProfile: ["citrus", "mint", "ocean", "fresh"]
        },
        {
          id: "sweet",
          label: { en: "Sweet", pl: "Słodkie" },
          value: "sweet",
          scentProfile: ["vanilla", "caramel", "honey", "warm"]
        }
      ]
    },
    {
      id: "time-of-day",
      question: {
        en: "When do you usually light candles?",
        pl: "Kiedy zazwyczaj zapalasz świece?"
      },
      options: [
        {
          id: "morning",
          label: { en: "Morning", pl: "Rano" },
          value: "morning",
          scentProfile: ["citrus", "fresh", "energizing"]
        },
        {
          id: "afternoon",
          label: { en: "Afternoon", pl: "Popołudnie" },
          value: "afternoon",
          scentProfile: ["light", "fresh", "floral"]
        },
        {
          id: "evening",
          label: { en: "Evening", pl: "Wieczór" },
          value: "evening",
          scentProfile: ["warm", "cozy", "relaxing"]
        },
        {
          id: "night",
          label: { en: "Night", pl: "Noc" },
          value: "night",
          scentProfile: ["calming", "lavender", "sandalwood"]
        }
      ]
    },
    {
      id: "personality",
      question: {
        en: "Which word describes you best?",
        pl: "Które słowo najlepiej Cię opisuje?"
      },
      options: [
        {
          id: "adventurous",
          label: { en: "Adventurous", pl: "Pełen Przygód" },
          value: "adventurous",
          scentProfile: ["citrus", "spicy", "exotic"]
        },
        {
          id: "peaceful",
          label: { en: "Peaceful", pl: "Spokojny" },
          value: "peaceful",
          scentProfile: ["lavender", "vanilla", "calming"]
        },
        {
          id: "sophisticated",
          label: { en: "Sophisticated", pl: "Wyrafinowany" },
          value: "sophisticated",
          scentProfile: ["woody", "amber", "complex"]
        },
        {
          id: "cheerful",
          label: { en: "Cheerful", pl: "Radosny" },
          value: "cheerful",
          scentProfile: ["floral", "fresh", "uplifting"]
        }
      ]
    }
  ];

  const handleAnswer = (optionValue: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: optionValue };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Quiz complete - calculate results
      calculateResults(newAnswers);
    }
  };

  const calculateResults = async (finalAnswers: Record<string, string>) => {
    // Collect all scent profiles from answers
    const scentProfiles: string[] = [];
    questions.forEach((q) => {
      const answer = finalAnswers[q.id];
      const option = q.options.find((opt) => opt.value === answer);
      if (option) {
        scentProfiles.push(...option.scentProfile);
      }
    });

    // Fetch products and calculate scores
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("published", true);

    if (products) {
      // Mock scoring based on category/description matching
      const scoredProducts = products.map((product) => {
        let score = 0;
        const productText = `${product.category} ${product.description_en} ${product.name_en}`.toLowerCase();
        
        scentProfiles.forEach((profile) => {
          if (productText.includes(profile.toLowerCase())) {
            score += 1;
          }
        });

        return {
          productId: product.id,
          name: { en: product.name_en, pl: product.name_pl },
          score,
          image: product.image_url || "",
          description: { en: product.description_en || "", pl: product.description_pl || "" }
        };
      });

      // Sort by score and take top 3
      const topResults = scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setResults(topResults);
      setShowResults(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Save quiz results to profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            quiz_results: {
              answers: finalAnswers,
              scentProfiles,
              topProducts: topResults.map(r => r.productId),
              completedAt: new Date().toISOString()
            }
          })
          .eq("user_id", user.id);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background py-20">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
        
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {language === 'pl' ? 'Twoje Idealne Świece!' : 'Your Perfect Candles!'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'pl'
                ? 'Na podstawie Twoich odpowiedzi, polecamy te świece:'
                : 'Based on your answers, we recommend these candles:'}
            </p>
          </motion.div>

          <div className="grid gap-6 mb-8">
            {results.map((result, index) => (
              <motion.div
                key={result.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.name[language]}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {result.name[language]}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {result.description[language]}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate(`/product/${result.productId}`)}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        {language === 'pl' ? 'Zobacz Szczegóły' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRestart} variant="outline">
              {language === 'pl' ? 'Powtórz Quiz' : 'Retake Quiz'}
            </Button>
            <Button onClick={() => navigate('/shop')}>
              {language === 'pl' ? 'Przeglądaj Wszystkie' : 'Browse All'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {language === 'pl' ? 'Pytanie' : 'Question'} {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
              {currentQ.question[language]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQ.options.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleAnswer(option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                    answers[currentQ.id] === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                  }`}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt={option.label[language]}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg text-foreground">
                    {option.label[language]}
                  </h3>
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Wstecz' : 'Previous'}
              </Button>
              
              {answers[currentQ.id] && (
                <Button
                  onClick={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1);
                    } else {
                      calculateResults(answers);
                    }
                  }}
                >
                  {currentQuestion === questions.length - 1
                    ? (language === 'pl' ? 'Zobacz Wyniki' : 'See Results')
                    : (language === 'pl' ? 'Dalej' : 'Next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScentQuiz;
