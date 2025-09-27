import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RangeSlider } from "@/components/ui/range-slider";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useTranslations } from "@/hooks/useTranslations";

interface SurveyData {
  dateRange: DateRange | undefined;
  timeRange: [number, number];
  companions: string;
  totalPeople: number;
  totalBudget: number;
  styles: string[];
  foodPreferences: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
  };
}

const Survey = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    dateRange: undefined,
    timeRange: [9, 21],
    companions: "",
    totalPeople: 1,
    totalBudget: 0,
    styles: [],
    foodPreferences: {
      dietaryRestrictions: [],
      cuisinePreferences: []
    }
  });

  const steps = [
    {
      title: t('survey.dates.question'),
      type: "datePicker",
      key: "dates"
    },
    {
      title: "What are your daily hours?",
      type: "timeRangeSlider",
      key: "timeRange",
      min: 6,
      max: 24
    },
    {
      title: t('survey.party.question'),
      type: "selection",
      key: "companions",
      options: [
        t('survey.party.solo'),
        t('survey.party.couple'),
        t('survey.party.family'),
        t('survey.party.friends'),
        t('survey.party.business')
      ]
    },
    {
      title: t('survey.budget.question'),
      type: "budget",
      key: "totalBudget"
    },
    {
      title: t('survey.interests.question'),
      type: "multiSelect",
      key: "styles",
      options: [
        { id: "shopping", label: `🛍️ ${t('survey.interests.shopping')}`, color: "bg-gradient-primary" },
        { id: "hiking", label: `🥾 ${t('survey.interests.nature')}`, color: "bg-gradient-secondary" },
        { id: "foodie", label: `🍜 ${t('survey.interests.food')}`, color: "bg-gradient-neon" },
        { id: "nature", label: `🌿 ${t('survey.interests.nature')}`, color: "bg-gradient-primary" },
        { id: "city", label: `🏙️ ${t('survey.interests.culture')}`, color: "bg-gradient-secondary" },
        { id: "cultural", label: `🏮 ${t('survey.interests.culture')}`, color: "bg-gradient-neon" },
        { id: "nightlife", label: `🌙 ${t('survey.interests.nightlife')}`, color: "bg-gradient-primary" },
        { id: "island", label: `🏝️ ${t('survey.interests.adventure')}`, color: "bg-gradient-secondary" },
        { id: "family", label: `👨‍👩‍👧‍👦 ${t('survey.party.family')}`, color: "bg-gradient-neon" },
        { id: "museums", label: `🏛️ ${t('survey.interests.culture')}`, color: "bg-gradient-primary" }
      ]
    },
    {
      title: "Any food preferences?",
      type: "foodPreferences",
      key: "foodPreferences",
      dietaryOptions: [
        { id: "vegetarian", label: "🥬 Vegetarian" },
        { id: "vegan", label: "🌱 Vegan" },
        { id: "halal", label: "☪️ Halal" },
        { id: "kosher", label: "✡️ Kosher" },
        { id: "gluten-free", label: "🌾 Gluten-Free" },
        { id: "dairy-free", label: "🥛 Dairy-Free" },
        { id: "keto", label: "🥑 Keto" },
        { id: "pescatarian", label: "🐟 Pescatarian" }
      ],
      cuisineOptions: [
        { id: "cantonese", label: "🥟 Dim Sum" },
        { id: "szechuan", label: "🌶️ Szechuan" },
        { id: "hotpot", label: "🍲 Hot Pot" },
        { id: "street-food", label: "🍢 Street Food" },
        { id: "seafood", label: "🦀 Seafood" },
        { id: "desserts", label: "🧁 Desserts" },
        { id: "tea", label: "🍵 Tea Houses" },
        { id: "international", label: "🌍 International" },
        { id: "roast", label: "🍖 Roast Meats" },
        { id: "noodles", label: "🍜 Noodles" }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleTimeRangeChange = (value: number[]) => {
    setSurveyData(prev => ({
      ...prev,
      timeRange: [value[0], value[1]]
    }));
  };

  const handleSelectionClick = (value: string) => {
    setSurveyData(prev => ({
      ...prev,
      companions: value
    }));
  };

  const handlePeopleCountChange = (value: string) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    setSurveyData(prev => ({
      ...prev,
      totalPeople: numValue
    }));
  };

  const handleMultiSelectToggle = (styleId: string) => {
    setSurveyData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }));
  };

  const handleBudgetChange = (value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setSurveyData(prev => ({
      ...prev,
      totalBudget: numValue
    }));
  };

  const handleFoodPreferenceToggle = (category: 'dietaryRestrictions' | 'cuisinePreferences', value: string) => {
    setSurveyData(prev => ({
      ...prev,
      foodPreferences: {
        ...prev.foodPreferences,
        [category]: prev.foodPreferences[category].includes(value)
          ? prev.foodPreferences[category].filter(item => item !== value)
          : [...prev.foodPreferences[category], value]
      }
    }));
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      // No selection, start fresh
      setSurveyData(prev => ({
        ...prev,
        dateRange: range
      }));
      return;
    }

    if (!surveyData.dateRange?.from || !surveyData.dateRange?.to) {
      // First selection or incomplete range, use default behavior
      setSurveyData(prev => ({
        ...prev,
        dateRange: range
      }));
      return;
    }

    // Both dates are selected, determine which one to update based on proximity
    if (range.from && !range.to) {
      const clickedDate = range.from;
      const currentStart = surveyData.dateRange.from;
      const currentEnd = surveyData.dateRange.to;
      
      const distanceToStart = Math.abs(differenceInDays(clickedDate, currentStart));
      const distanceToEnd = Math.abs(differenceInDays(clickedDate, currentEnd));
      
      if (distanceToStart <= distanceToEnd) {
        // Closer to start date, update start
        setSurveyData(prev => ({
          ...prev,
          dateRange: {
            from: clickedDate,
            to: currentEnd
          }
        }));
      } else {
        // Closer to end date, update end
        setSurveyData(prev => ({
          ...prev,
          dateRange: {
            from: currentStart,
            to: clickedDate
          }
        }));
      }
    } else {
      // Range selection, use as-is
      setSurveyData(prev => ({
        ...prev,
        dateRange: range
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate("/weather-info", { 
        state: { 
          surveyData: {
            ...surveyData,
            startDate: surveyData.dateRange?.from,
            endDate: surveyData.dateRange?.to,
            startTime: surveyData.timeRange[0],
            endTime: surveyData.timeRange[1]
          }
        }
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate("/");
    }
  };

  const canProceed = () => {
    if (currentStepData.type === "datePicker") {
      return surveyData.dateRange?.from && surveyData.dateRange?.to;
    }
    if (currentStepData.type === "selection") {
      return surveyData.companions !== "" && surveyData.totalPeople > 0;
    }
    if (currentStepData.type === "budget") {
      return surveyData.totalBudget > 0;
    }
    if (currentStepData.type === "multiSelect") {
      return surveyData.styles.length > 0;
    }
    return true;
  };

  const getDailyBudget = () => {
    if (!surveyData.dateRange?.from || !surveyData.dateRange?.to || surveyData.totalBudget === 0) {
      return 0;
    }
    const days = differenceInDays(surveyData.dateRange.to, surveyData.dateRange.from) + 1;
    return Math.round(surveyData.totalBudget / days);
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-hero flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-muted/20 h-2">
        <div 
          className="h-full progress-gradient rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-md mx-auto w-full">
        {/* Step Counter */}
        <div className="text-center mb-8">
          <div className="text-muted-foreground text-sm mb-2">
            {t('survey.progress', { current: currentStep + 1, total: steps.length })}
          </div>
          <h1 className="text-2xl font-bold text-foreground animate-fade-in">
            {currentStepData.title}
          </h1>
        </div>

        {/* Question Content */}
        <Card className={`w-full card-hover border-0 p-8 mb-8 animate-scale-in ${
          currentStep === 2 || currentStep === 5 ? '' : 'max-h-[60vh] overflow-y-auto'
        }`}>
          {currentStepData.type === "datePicker" && (
            <div className="space-y-4">
              {/* Selected dates display */}
              {surveyData.dateRange?.from && (
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Selected dates:</div>
                  <div className="text-lg font-semibold">
                    {format(surveyData.dateRange.from, "MMM dd")}
                    {surveyData.dateRange.to && surveyData.dateRange.to !== surveyData.dateRange.from && (
                      <span> - {format(surveyData.dateRange.to, "MMM dd, yyyy")}</span>
                    )}
                    {!surveyData.dateRange.to && <span className="text-muted-foreground"> (select end date)</span>}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={surveyData.dateRange}
                  onSelect={handleDateRangeSelect}
                  disabled={(date) => date < new Date()}
                  numberOfMonths={1}
                  className="pointer-events-auto border rounded-md"
                />
              </div>
            </div>
          )}

          {currentStepData.type === "timeRangeSlider" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
                  {formatTime(surveyData.timeRange[0])} - {formatTime(surveyData.timeRange[1])}
                </div>
                <div className="text-sm text-muted-foreground">
                  {surveyData.timeRange[1] - surveyData.timeRange[0]} hours of exploration
                </div>
              </div>
              <RangeSlider
                value={surveyData.timeRange}
                onValueChange={handleTimeRangeChange}
                min={currentStepData.min}
                max={currentStepData.max}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {currentStepData.type === "selection" && (
            <div className="space-y-6">
              {/* Travel companion type selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground text-center">
                  Travel Style
                </h3>
                <div className="grid gap-3">
                  {currentStepData.options?.map((option) => (
                    <Button
                      key={option}
                      variant={surveyData.companions === option ? "default" : "outline"}
                      size="lg"
                      className={`interactive-scale text-left justify-start h-auto py-4 ${
                        surveyData.companions === option ? "neon-button" : ""
                      }`}
                      onClick={() => handleSelectionClick(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Total number of people */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground text-center">
                  {t('survey.party.total')}
                </h3>
                <div className="text-center">
                  <Input
                    type="number"
                    placeholder={t('survey.party.total')}
                    value={surveyData.totalPeople || ""}
                    onChange={(e) => handlePeopleCountChange(e.target.value)}
                    className="text-center text-xl font-semibold h-14 border-2 max-w-48 mx-auto"
                    min="1"
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    Including yourself
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStepData.type === "budget" && (
            <div className="space-y-6">
              <div className="text-center">
                <Input
                  type="number"
                  placeholder="Enter total budget (USD)"
                  value={surveyData.totalBudget || ""}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="text-center text-xl font-semibold h-14 border-2"
                  min="0"
                />
              </div>
              {surveyData.totalBudget > 0 && surveyData.dateRange?.from && surveyData.dateRange?.to && (
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Daily Budget</div>
                  <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                    ${getDailyBudget()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    for {differenceInDays(surveyData.dateRange.to, surveyData.dateRange.from) + 1} days
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStepData.type === "multiSelect" && (
            <div className="grid grid-cols-2 gap-3">
              {currentStepData.options?.map((option: any) => (
                <Button
                  key={option.id}
                  variant={surveyData.styles.includes(option.id) ? "default" : "outline"}
                  size="sm"
                  className={`interactive-scale text-left justify-start h-auto py-4 text-xs ${
                    surveyData.styles.includes(option.id) ? "neon-button" : ""
                  }`}
                  onClick={() => handleMultiSelectToggle(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {currentStepData.type === "foodPreferences" && (
            <div className="space-y-6">
              {/* Dietary Restrictions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Dietary Requirements (optional)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentStepData.dietaryOptions?.map((option: any) => (
                    <Button
                      key={option.id}
                      variant={surveyData.foodPreferences.dietaryRestrictions.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      className={`h-auto py-2 px-2 text-xs transition-all duration-300 hover:scale-105 ${
                        surveyData.foodPreferences.dietaryRestrictions.includes(option.id) ? "neon-button" : ""
                      }`}
                      onClick={() => handleFoodPreferenceToggle('dietaryRestrictions', option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Cuisine Interests (optional)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentStepData.cuisineOptions?.map((option: any) => (
                    <Button
                      key={option.id}
                      variant={surveyData.foodPreferences.cuisinePreferences.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      className={`h-auto py-2 px-2 text-xs transition-all duration-300 hover:scale-105 ${
                        surveyData.foodPreferences.cuisinePreferences.includes(option.id) ? "neon-button" : ""
                      }`}
                      onClick={() => handleFoodPreferenceToggle('cuisinePreferences', option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            className="flex-1 interactive-scale"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('survey.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 neon-button"
          >
            {currentStep === steps.length - 1 ? t('survey.submit') : t('survey.next')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Survey;