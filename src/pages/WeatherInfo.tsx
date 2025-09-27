import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, Users, Calendar, ArrowRight, ArrowLeft, CloudRain, CloudSnow } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const WeatherInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { surveyData } = location.state || {};
  const [dailyWeather, setDailyWeather] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WEATHER_API_KEY = "50c6ebc8251d4ef8b5b102019252509";

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return Sun;
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return CloudRain;
    if (lowerCondition.includes('snow')) return CloudSnow;
    if (lowerCondition.includes('cloud')) return Cloud;
    return Sun; // default
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Get the date range from survey data
      const dateRange = surveyData?.dateRange;
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error('No travel dates selected');
      }

      // Calculate days between start and end date
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      const days = Math.min(daysDiff, 10); // weatherAPI.com free tier supports up to 10 days
      
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=Hong Kong&days=${days}&aqi=no&alerts=no&dt=${startDate.toISOString().split('T')[0]}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Filter to only show dates within the travel range
      const formattedWeather = data.forecast.forecastday
        .filter((day: any) => {
          const dayDate = new Date(day.date);
          return dayDate >= startDate && dayDate <= endDate;
        })
        .map((day: any) => {
          const date = new Date(day.date);
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          
          return {
            day: dayNames[date.getDay()],
            date: date.getDate(),
            temperature: Math.round(day.day.avgtemp_c),
            condition: day.day.condition.text,
            humidity: day.day.avghumidity,
            icon: getWeatherIcon(day.day.condition.text)
          };
        });
      
      setDailyWeather(formattedWeather);
      setError(null);
    } catch (err) {
      console.error('Weather API error:', err);
      setError('Unable to load weather data');
      // Fallback to mock data using the selected date range
      const dateRange = surveyData?.dateRange;
      let days = 7;
      if (dateRange?.from && dateRange?.to) {
        const startDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      }
      
      const mockData = Array.from({ length: days }, (_, i) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7],
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).getDate(),
        temperature: 22 + (i % 5),
        condition: "Partly Cloudy",
        humidity: 70,
        icon: Sun
      }));
      setDailyWeather(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [surveyData?.dateRange]);

  const crowdData = {
    level: "Moderate",
    description: "Tourist areas will be busy during peak hours (10AM-2PM). Consider visiting popular spots early morning or late afternoon.",
    bestTimes: ["8:00 AM - 10:00 AM", "4:00 PM - 6:00 PM"]
  };

  const events = [
    {
      name: "Hong Kong Arts Festival",
      date: "Running until next week",
      location: "Various venues",
      description: "World-class performances across the city"
    },
    {
      name: "Night Markets",
      date: "Every evening",
      location: "Temple Street & Ladies' Market",
      description: "Perfect for shopping and street food"
    }
  ];

  const handleContinue = () => {
    navigate("/landmarks", { state: { surveyData } });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="relative text-center mb-8 pt-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/survey", { state: { surveyData } })}
            className="absolute left-0 top-8 p-2 hover:bg-muted/20 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 animate-fade-in">
            {t('weather.title')}
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Here's what to expect during your {surveyData?.days}-day adventure
          </p>
        </div>

        <div className="space-y-4">
          {/* Combined Weather Card - Full Width */}
          <Card className="bg-gradient-card card-hover border border-border/50 p-6 animate-scale-in shadow-elevated">
            <h3 className="text-lg font-display font-semibold mb-4 text-center text-gradient">
              Daily Weather Forecast {error && <span className="text-xs text-muted-foreground">(Offline Mode)</span>}
            </h3>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {dailyWeather.map((day, index) => (
                  <div key={index} className="flex-shrink-0 text-center min-w-[70px] p-3 bg-gradient-subtle rounded-xl border border-border/30 hover:shadow-subtle transition-all duration-300 hover:scale-105">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{day.day}</p>
                    <p className="text-xs text-muted-foreground mb-2">{day.date}</p>
                    <div className="mb-2">
                      <day.icon className="w-6 h-6 mx-auto text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-bold text-primary mb-1">{day.temperature}°</p>
                    <p className="text-xs text-muted-foreground">{day.condition}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Other Cards in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Crowd Level Card */}
            <Card className="bg-gradient-card card-hover border border-border/50 p-4 animate-scale-in aspect-square flex flex-col justify-center shadow-card">
              <div className="text-center">
                <div className="p-3 bg-gradient-accent rounded-full w-fit mx-auto mb-3 shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold mb-2">Crowd Levels</h3>
                <p className="text-xl font-bold text-primary mb-2">{crowdData.level}</p>
                <div className="text-xs">
                  <div className="glass p-2 rounded-lg">
                    <p className="font-medium text-primary">Best: 8-10AM</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Events Cards - Split into 2 */}
            {events.map((event, index) => (
              <Card key={index} className="card-hover border-0 p-4 animate-scale-in aspect-square flex flex-col justify-center">
                <div className="text-center">
                  <div className="p-3 bg-gradient-neon rounded-full w-fit mx-auto mb-3 shadow-glow">
                    <Calendar className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">Events</h3>
                  <div className="bg-muted/20 p-2 rounded-lg">
                    <h4 className="font-semibold text-foreground text-xs mb-1">{event.name}</h4>
                    <p className="text-xs text-primary">{event.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full mt-8 neon-button py-6 text-lg font-semibold rounded-2xl shadow-elevated"
        >
          {t('landmarks.title')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default WeatherInfo;