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

  // Open-Meteo does not require an API key for basic forecasts

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

  // Map Open-Meteo weather codes to simple human-readable conditions
  const mapWeatherCodeToText = (code: number) => {
    // Reference: https://open-meteo.com/en/docs#api_form
    // Codes: 0 = Clear, 1-3 = Mainly Clear/Partly Cloudy/Overcast, 45/48 = Fog, 51-67 = Drizzle/Rain, 71-77 = Snow,
    // 80-82 = Rain showers, 85-86 = Snow showers, 95-99 = Thunderstorm
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Partly Cloudy';
  };

  // Format a Date to YYYY-MM-DD using the local date (avoids UTC shift)
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Get the date range from survey data
      const dateRange = surveyData?.dateRange;
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error('No travel dates selected');
      }

      // Check if the selected date is more than 14 days ahead
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      const daysFromToday = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysFromToday > 14) {
        throw new Error('DATE_TOO_FAR');
      }

  // Normalize start/end to include full days (include last day)
  const endDate = new Date(dateRange.to);
  endDate.setHours(23, 59, 59, 999);

  // Calculate number of days (inclusive)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const days = Math.min(daysDiff, 10); // weatherapi.com free tier supports up to 10 days

  // Use Open-Meteo for forecast data (no API key required)
  const lat = 22.3193; // Hong Kong latitude
  const lon = 114.1694; // Hong Kong longitude
  const startStr = formatLocalDate(startDate);
  const endStr = formatLocalDate(endDate);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia%2FHong_Kong&start_date=${startStr}&end_date=${endStr}`;
  console.log('OpenMeteo fetch - startDate:', startStr, 'endDate:', endStr, 'days:', days, 'url:', url);

  const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Open-Meteo returns daily arrays; map them to the UI shape
      const formattedWeather = [] as any[];
      if (data && data.daily && Array.isArray(data.daily.time)) {
        const times: string[] = data.daily.time;
        const tMax: number[] = data.daily.temperature_2m_max || [];
        const tMin: number[] = data.daily.temperature_2m_min || [];
        const codes: number[] = data.daily.weathercode || [];

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 0; i < times.length; i++) {
          const date = new Date(times[i]);
          const max = typeof tMax[i] === 'number' ? tMax[i] : null;
          const min = typeof tMin[i] === 'number' ? tMin[i] : null;
          let temperature: number;
          if (max !== null) {
            temperature = Math.round(max);
          } else if (min !== null) {
            temperature = Math.round(min);
          } else {
            temperature = 0;
          }
          const code = codes[i] ?? -1;
          const condition = mapWeatherCodeToText(code);

          formattedWeather.push({
            day: dayNames[date.getDay()],
            date: date.getDate(),
            temperature: temperature,
            condition,
            humidity: null,
            icon: getWeatherIcon(condition)
          });
        }
      } else {
        console.warn('OpenMeteo: unexpected response shape', data);
      }

      console.log('Formatted weather items:', formattedWeather.length, formattedWeather);

      // If Open-Meteo returned no usable days, fallback to mock data for the trip dates
      if (!formattedWeather.length) {
        console.warn('No formatted weather from Open-Meteo, generating mock for trip dates');
        const mockData = Array.from({ length: days }, (_, i) => {
          const dayDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          return {
            day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayDate.getDay()],
            date: dayDate.getDate(),
            temperature: 22 + (i % 5),
            condition: "Partly Cloudy",
            humidity: 70,
            icon: Sun
          };
        });
        setDailyWeather(mockData);
      } else {
        setDailyWeather(formattedWeather);
      }
      setError(null);
    } catch (err) {
      console.error('Weather API error:', err);
      if (err instanceof Error && err.message === 'DATE_TOO_FAR') {
        setError('Selected dates exceed available weather data. Please choose dates within 14 days from today.');
      } else {
        setError('Unable to load weather data');
      }
      setDailyWeather([]); // Clear any existing weather data
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
                Daily Weather Forecast
              </h3>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Cloud className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2 text-center">{error}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {error.includes('exceed available weather data') 
                      ? 'Weather forecasts are only available for the next 14 days' 
                      : 'Weather information is temporarily unavailable'
                    }
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {dailyWeather.map((day, index) => (
                    <div key={index} className="flex-shrink-0 w-24 text-center p-2 bg-gradient-subtle rounded-xl border border-border/30 hover:shadow-subtle transition-all duration-300 hover:scale-105">
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
            <Card className="bg-gradient-card card-hover border border-border/50 p-6 animate-scale-in shadow-elevated flex-[6] min-h-0">
              <h3 className="text-lg font-display font-semibold mb-4 text-center text-gradient">
                Events During Your Travel
              </h3>
              <div className="overflow-x-auto overflow-y-hidden flex gap-4 items-start">
                {filteredEvents.map((event, index) => (
                  <div key={index} className="w-64 flex-shrink-0 flex flex-col justify-center items-center border border-border/20 rounded-xl p-2 sm:p-4 shadow-card">
                    <div className="mb-3 w-full">
                      <img src={event.image} alt={event.name} className="w-full h-32 object-cover rounded-lg" />
                    </div>
                    <div
                      className="text-lg font-semibold mb-2 text-center"
                      title={event.name}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.2',
                        height: '2.6em'
                      }}
                    >
                      {event.name}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{event.date}</p>
                    <p className="text-sm text-foreground mb-2">{event.location}</p>
                  </div>
                ))}
              </div>
            </Card>
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