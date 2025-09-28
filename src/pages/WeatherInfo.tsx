import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, Users, Calendar, ArrowRight, ArrowLeft, CloudRain, CloudSnow } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { events } from "@/lib/events";

const WeatherInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { surveyData } = location.state || {};
  const [dailyWeather, setDailyWeather] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WEATHER_API_KEY = "235247215c10867579d72a3e7efb722fd9184b30";

  // Filter events based on user's travel dates
  const filteredEvents = useMemo(() => {
    const dateRange = surveyData?.dateRange;
    if (!dateRange?.from || !dateRange?.to) return events;

    const travelStart = new Date(dateRange.from);
    travelStart.setHours(0, 0, 0, 0);
    const travelEnd = new Date(dateRange.to);
    travelEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      // Parse event date string (handles various formats like "01 Oct 2025", "05-07 Oct 2025", "04 Jul 2025 - 29 Mar 2026")
      const parseEventDate = (dateStr: string) => {
        // Handle date ranges like "04 Jul 2025 - 29 Mar 2026"
        if (dateStr.includes(' - ')) {
          const [startStr] = dateStr.split(' - ');
          return new Date(startStr + (startStr.includes('2025') ? '' : ' 2025'));
        }

        // Handle date ranges like "05-07 Oct 2025"
        if (dateStr.includes('-') && dateStr.split('-').length === 3) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const startDay = parts[0].trim();
            const monthYear = parts[2].trim();
            return new Date(`${startDay} ${monthYear}`);
          }
        }

        // Handle single dates like "01 Oct 2025"
        return new Date(dateStr + (dateStr.includes('2025') ? '' : ' 2025'));
      };

      const eventStart = parseEventDate(event.date);
      let eventEnd = eventStart;

      // For date ranges, parse the end date
      if (event.date.includes(' - ')) {
        const [, endStr] = event.date.split(' - ');
        eventEnd = new Date(endStr);
      } else if (event.date.includes('-') && event.date.split('-').length === 3) {
        // Handle "05-07 Oct 2025" format
        const parts = event.date.split('-');
        if (parts.length === 3) {
          const endDay = parts[1].trim();
          const monthYear = parts[2].trim();
          eventEnd = new Date(`${endDay} ${monthYear}`);
        }
      }

      // Check if event overlaps with travel dates
      return eventStart <= travelEnd && eventEnd >= travelStart;
    });
  }, [surveyData?.dateRange]);

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

  const handleContinue = () => {
    navigate("/itinerary", { 
      state: { 
        surveyData,
        selectedLandmarks: surveyData?.selectedLandmarks || []
      } 
    });
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-hero overflow-hidden">
      <div className="max-w-md mx-auto p-3 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="relative text-center mb-4 pt-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/survey", { state: { surveyData, step: 6 } })}
            className="absolute left-0 top-4 p-2 hover:bg-muted/20 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 animate-fade-in">
            Trip Overview
          </h1>
        </div>

  <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Weather and Events Container - Split equally */}
          <div className="flex flex-col flex-1 gap-4 min-h-0">
            {/* Weather Section - Top Half */}
            <Card className="bg-gradient-card card-hover border border-border/50 p-6 animate-scale-in shadow-elevated flex-[4] min-h-0">
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

            {/* Events Section - Bottom Half */}
            <div className="bg-white rounded-2xl shadow-elevated p-4 overflow-x-auto overflow-y-hidden flex gap-4 items-start flex-[6] min-h-0">
              {filteredEvents.map((event, index) => (
                <div key={index} className="w-64 flex-shrink-0 flex flex-col justify-center items-center border border-border/20 rounded-xl p-2 sm:p-4 shadow-card">
                  <div className="mb-3 w-full">
                    <img src={event.image} alt={event.name} className="w-full h-32 object-cover rounded-lg" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">{event.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{event.date}</p>
                  <p className="text-sm text-foreground mb-2">{event.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full mt-8 neon-button py-6 text-lg font-semibold rounded-2xl shadow-elevated"
        >
          Create Itinerary
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default WeatherInfo;