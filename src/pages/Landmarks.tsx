import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Clock, Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const Landmarks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { surveyData } = location.state || {};
  const [selectedLandmarks, setSelectedLandmarks] = useState<string[]>([]);

  const landmarks = [
    {
      id: "disneyland",
      name: "Hong Kong Disneyland",
      category: "Family",
      rating: 4.5,
      duration: "Full Day",
      image: "🏰",
      description: "Magical kingdom with thrilling rides and Disney characters",
      tags: ["family", "entertainment"]
    },
    {
      id: "victoria-peak",
      name: "Victoria Peak",
      category: "Views",
      rating: 4.8,
      duration: "3-4 hours",
      image: "⛰️",
      description: "Stunning panoramic views of Hong Kong skyline",
      tags: ["city", "nature", "views"]
    },
    {
      id: "victoria-harbour",
      name: "Victoria Harbour",
      category: "Waterfront",
      rating: 4.7,
      duration: "2-3 hours",
      image: "🌊",
      description: "Iconic harbour with Symphony of Lights show",
      tags: ["city", "cultural", "nightlife"]
    },
    {
      id: "ocean-park",
      name: "Ocean Park",
      category: "Theme Park",
      rating: 4.4,
      duration: "Full Day",
      image: "🐋",
      description: "Marine life theme park with exciting rides",
      tags: ["family", "nature", "entertainment"]
    },
    {
      id: "avenue-of-stars",
      name: "Avenue of Stars",
      category: "Cultural",
      rating: 4.2,
      duration: "1-2 hours",
      image: "🌟",
      description: "Waterfront promenade celebrating Hong Kong cinema",
      tags: ["cultural", "city", "views"]
    },
    {
      id: "dragons-back",
      name: "Dragon's Back Trail",
      category: "Hiking",
      rating: 4.6,
      duration: "4-5 hours",
      image: "🐲",
      description: "Spectacular hiking trail with coastal views",
      tags: ["hiking", "nature", "adventure"]
    },
    {
      id: "m-plus-museum",
      name: "M+ Museum",
      category: "Museum",
      rating: 4.3,
      duration: "2-3 hours",
      image: "🏛️",
      description: "Contemporary visual culture museum",
      tags: ["museums", "cultural", "art"]
    },
    {
      id: "temple-street-night-market",
      name: "Temple Street Night Market",
      category: "Shopping",
      rating: 4.1,
      duration: "2-3 hours",
      image: "🏮",
      description: "Bustling night market for food and shopping",
      tags: ["shopping", "foodie", "nightlife"]
    }
  ];

  const handleLandmarkToggle = (landmarkId: string) => {
    setSelectedLandmarks(prev =>
      prev.includes(landmarkId)
        ? prev.filter(id => id !== landmarkId)
        : [...prev, landmarkId]
    );
  };

  const handleContinue = () => {
    navigate("/itinerary", { 
      state: { 
        surveyData, 
        selectedLandmarks: landmarks.filter(l => selectedLandmarks.includes(l.id))
      } 
    });
  };

  const isSelected = (landmarkId: string) => selectedLandmarks.includes(landmarkId);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="relative text-center mb-8 pt-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/weather-info", { state: { surveyData } })}
            className="absolute left-0 top-8 p-2 hover:bg-muted/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
            {t('landmarks.title')}
          </h1>
          <p className="text-muted-foreground animate-fade-in">
            Select the places you'd like to visit ({selectedLandmarks.length} selected)
          </p>
        </div>

        {/* Landmarks Grid */}
        <div className="space-y-4 mb-8">
          {landmarks.map((landmark, index) => (
            <Card 
              key={landmark.id}
              className={`p-4 cursor-pointer transition-all duration-300 animate-scale-in ${
                isSelected(landmark.id) 
                  ? "bg-gradient-neon shadow-neon border-2 border-red-500" 
                  : "border-0"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleLandmarkToggle(landmark.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{landmark.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{landmark.name}</h3>
                    {isSelected(landmark.id) && (
                      <div className="w-2 h-2 bg-accent rounded-full animate-glow-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{landmark.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span>{landmark.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{landmark.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{landmark.category}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {landmark.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full neon-button py-4"
        >
          {t('itinerary.title')} ({selectedLandmarks.length} places)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Landmarks;