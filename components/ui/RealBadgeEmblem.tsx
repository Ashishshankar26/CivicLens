import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Polygon,
  G,
  Text as SvgText,
  Rect,
} from 'react-native-svg';

// 4-point diamond sparkle star SVG path helper
function renderSparkle(cx: number, cy: number, size: number, color: string = '#FFFFFF') {
  const d = `M ${cx} ${cy - size} Q ${cx} ${cy} ${cx + size} ${cy} Q ${cx} ${cy} ${cx} ${cy + size} Q ${cx} ${cy} ${cx - size} ${cy} Q ${cx} ${cy} ${cx} ${cy - size} Z`;
  return <Path key={`spk-${cx}-${cy}`} d={d} fill={color} />;
}

export type ExactBadgeArtType =
  | 'coffee'
  | 'salad'
  | 'spaghetti'
  | 'burger'
  | 'mountaineer'
  | 'taco'
  | 'camel_desert'
  | 'treasure_chest'
  | 'gold_star_shield'
  | 'city_skyline'
  | 'hexagon_25'
  | 'hexagon_50'
  | 'octagon_100'
  | 'celebration_party';

export interface ExactBadgeDef {
  artType: ExactBadgeArtType;
  customNumber?: string;
}

const BADGE_MAP: Record<string, ExactBadgeDef> = {
  // Onboarding & Novice
  first_step: { artType: 'coffee' },
  sharp_eye: { artType: 'city_skyline' },
  first_verifier: { artType: 'salad' },
  ready_scout: { artType: 'burger' },
  location_scout: { artType: 'mountaineer' },
  quick_responder: { artType: 'taco' },

  // Potholes & Roads
  pothole_novice: { artType: 'spaghetti' },
  pothole_patrol: { artType: 'camel_desert' },
  pothole_hunter: { artType: 'treasure_chest' },
  pothole_master: { artType: 'gold_star_shield' },
  road_guardian: { artType: 'hexagon_25', customNumber: '25' },
  asphalt_doctor: { artType: 'city_skyline' },
  crater_crusher: { artType: 'celebration_party' },
  smooth_streets: { artType: 'burger' },

  // Lighting & Streetlight
  lamp_spotter: { artType: 'coffee' },
  light_keeper: { artType: 'spaghetti' },
  dawn_patrol: { artType: 'camel_desert' },
  night_owl: { artType: 'taco' },
  grid_guardian: { artType: 'hexagon_50', customNumber: '50' },
  beacon_master: { artType: 'gold_star_shield' },

  // Waste & Sanitation
  eco_starter: { artType: 'salad' },
  eco_warrior: { artType: 'burger' },
  eco_sentinel: { artType: 'city_skyline' },
  zero_waste_hero: { artType: 'treasure_chest' },

  // Verification & Trust
  verify_bronze: { artType: 'coffee' },
  verify_silver: { artType: 'hexagon_25', customNumber: '25' },
  verify_gold: { artType: 'gold_star_shield' },
  verify_platinum: { artType: 'hexagon_50', customNumber: '50' },
  double_check: { artType: 'salad' },
  hawk_eye: { artType: 'mountaineer' },
  peer_trusted: { artType: 'celebration_party' },

  // Resolution & Champions
  fix_witness: { artType: 'city_skyline' },
  before_after: { artType: 'burger' },
  city_healer: { artType: 'treasure_chest' },

  // Streaks & Loyalty
  streak_3: { artType: 'taco' },
  streak_7: { artType: 'camel_desert' },
  streak_14: { artType: 'mountaineer' },
  streak_30: { artType: 'treasure_chest' },
  weekend_hero: { artType: 'coffee' },
  holiday_keeper: { artType: 'celebration_party' },

  // Milestones (Exact Numbers & Shields from Image)
  milestone_5: { artType: 'hexagon_25', customNumber: '5' },
  milestone_10: { artType: 'hexagon_25', customNumber: '10' },
  milestone_25: { artType: 'hexagon_25', customNumber: '25' },
  milestone_50: { artType: 'hexagon_50', customNumber: '50' },
  milestone_100: { artType: 'octagon_100', customNumber: '100' },
  milestone_250: { artType: 'hexagon_50', customNumber: '250' },
  milestone_500: { artType: 'octagon_100', customNumber: '500' },
  ai_visionary: { artType: 'gold_star_shield' },
  legendary_guardian: { artType: 'gold_star_shield' },
};

interface RealBadgeEmblemProps {
  id: string;
  size?: number;
  isUnlocked?: boolean;
}

export const RealBadgeEmblem: React.FC<RealBadgeEmblemProps> = ({
  id,
  size = 56,
  isUnlocked = true,
}) => {
  const normId = (id || '').toLowerCase().trim();
  const def: ExactBadgeDef = BADGE_MAP[normId] || { artType: 'gold_star_shield' };

  // If locked, render a clean desaturated locked state
  if (!isUnlocked) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="46" fill="#475569" stroke="#94A3B8" strokeWidth="4" />
          <Circle cx="50" cy="50" r="35" fill="#334155" />
          {/* Padlock Icon */}
          <Path
            d="M 38 46 L 38 35 C 38 28.37 43.37 23 50 23 C 56.63 23 62 28.37 62 35 L 62 46"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <Rect x="33" y="44" width="34" height="26" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <Circle cx="50" cy="55" r="3" fill="#94A3B8" />
          <Path d="M 50 57 L 50 63" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      </View>
    );
  }

  // 1. COFFEE CUP WITH STEAM (Top-Left Brown Medallion)
  if (def.artType === 'coffee') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="coffeeRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#A06956" />
              <Stop offset="100%" stopColor="#6D4336" />
            </LinearGradient>
            <RadialGradient id="coffeeBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#F5EBE6" />
              <Stop offset="100%" stopColor="#D7CCC8" />
            </RadialGradient>
          </Defs>

          {/* Outer Rim */}
          <Circle cx="50" cy="50" r="47" fill="url(#coffeeRim)" stroke="#BA8A7B" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#coffeeBg)" stroke="#5D3528" strokeWidth="1.5" />

          {/* 45-deg drop shadow bar */}
          <Path d="M 28 66 L 74 66 L 68 76 L 22 76 Z" fill="#4E342E" opacity={0.35} />

          {/* Saucer */}
          <Path d="M 33 66 L 67 66 L 63 70 L 37 70 Z" fill="#FFFFFF" />
          <Path d="M 37 70 L 63 70 L 60 72 L 40 72 Z" fill="#E0E0E0" />

          {/* Ceramic Cup */}
          <Path d="M 35 44 C 35 62 65 62 65 44 Z" fill="#FFFFFF" />
          <Path d="M 38 44 C 38 58 62 58 62 44 Z" fill="#ECEFF1" />
          {/* Cup Handle */}
          <Path d="M 64 47 C 73 47 73 57 63 57" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />

          {/* Rising Steam Curves */}
          <Path d="M 44 38 Q 41 30 46 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.8} />
          <Path d="M 50 38 Q 54 28 48 20" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
          <Path d="M 56 38 Q 53 32 58 26" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.8} />

          {/* Sparkles */}
          {renderSparkle(28, 30, 4)}
          {renderSparkle(22, 54, 3)}
          {renderSparkle(78, 28, 4)}
        </Svg>
      </View>
    );
  }

  // 2. FRESH SALAD BOWL (Top-Center Blue Medallion)
  if (def.artType === 'salad') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="saladRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#03A9F4" />
              <Stop offset="100%" stopColor="#0277BD" />
            </LinearGradient>
            <RadialGradient id="saladBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#E1F5FE" />
              <Stop offset="100%" stopColor="#B3E5FC" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#saladRim)" stroke="#4FC3F7" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#saladBg)" stroke="#01579B" strokeWidth="1.5" />

          {/* Salad Greens & Tomato */}
          <Circle cx="44" cy="40" r="9" fill="#4CAF50" />
          <Circle cx="56" cy="38" r="10" fill="#66BB6A" />
          <Circle cx="50" cy="35" r="8" fill="#81C784" />
          {/* Red Tomatoes */}
          <Circle cx="48" cy="36" r="4.5" fill="#F44336" />
          <Circle cx="58" cy="40" r="4" fill="#E53935" />

          {/* White Bowl */}
          <Path d="M 28 44 C 28 66 72 66 72 44 Z" fill="#FFFFFF" />
          <Path d="M 33 44 C 33 60 67 60 67 44 Z" fill="#ECEFF1" />

          {/* Sparkles */}
          {renderSparkle(22, 28, 4)}
          {renderSparkle(76, 26, 3.5)}
        </Svg>
      </View>
    );
  }

  // 3. SPAGHETTI / PASTA PLATE (Lime Green Medallion)
  if (def.artType === 'spaghetti') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="pastaRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#D4E157" />
              <Stop offset="100%" stopColor="#9E9D24" />
            </LinearGradient>
            <RadialGradient id="pastaBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#F9FBE7" />
              <Stop offset="100%" stopColor="#DCEDC8" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#pastaRim)" stroke="#EEFF41" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#pastaBg)" stroke="#827717" strokeWidth="1.5" />

          {/* Diagonal White Serving Platter */}
          <Polygon points="30,70 76,46 70,40 24,64" fill="#E0E0E0" />
          <Polygon points="32,68 78,44 72,38 26,62" fill="#FFFFFF" />

          {/* Spaghetti Mound */}
          <Path d="M 40 56 C 40 40 64 40 64 56 Z" fill="#FBC02D" />
          <Path d="M 43 54 C 43 42 61 42 61 54 Z" fill="#FDD835" />
          {/* Tomato Sauce on top */}
          <Path d="M 46 44 Q 52 38 58 44 Q 54 48 46 44 Z" fill="#E53935" />

          {/* Honey Dipper / Fork at 45 deg */}
          <Path d="M 52 40 L 72 20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <Circle cx="54" cy="38" r="4" fill="#F57F17" />

          {/* Sparkles */}
          {renderSparkle(24, 40, 4)}
          {renderSparkle(78, 38, 4)}
          {renderSparkle(42, 28, 3)}
        </Svg>
      </View>
    );
  }

  // 4. HAMBURGER (Teal/Cyan Medallion)
  if (def.artType === 'burger') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="burgerRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#26C6DA" />
              <Stop offset="100%" stopColor="#00838F" />
            </LinearGradient>
            <RadialGradient id="burgerBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="100%" stopColor="#B2EBF2" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#burgerRim)" stroke="#80DEEA" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#burgerBg)" stroke="#006064" strokeWidth="1.5" />

          {/* Top Bun */}
          <Path d="M 32 44 C 32 28 68 28 68 44 Z" fill="#FFA726" />
          <Path d="M 36 43 C 36 32 64 32 64 43 Z" fill="#FFB74D" />
          {/* Sesame seeds */}
          <Circle cx="44" cy="35" r="1.2" fill="#FFF9C4" />
          <Circle cx="52" cy="33" r="1.2" fill="#FFF9C4" />
          <Circle cx="60" cy="36" r="1.2" fill="#FFF9C4" />

          {/* Red Tomato Slices */}
          <Rect x="30" y="44" width="40" height="4" rx="2" fill="#E53935" />

          {/* Yellow Cheese Triangle Drop */}
          <Polygon points="30,48 70,48 56,54" fill="#FFD54F" />

          {/* Patty */}
          <Rect x="28" y="48" width="44" height="6" rx="3" fill="#5D4037" />

          {/* Green Wavy Lettuce */}
          <Path d="M 28 54 Q 35 58 42 54 Q 50 58 58 54 Q 65 58 72 54" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Bottom Bun */}
          <Rect x="32" y="58" width="36" height="7" rx="3.5" fill="#FFA726" />

          {/* Sparkles */}
          {renderSparkle(20, 36, 4)}
          {renderSparkle(80, 42, 4)}
        </Svg>
      </View>
    );
  }

  // 5. MOUNTAINEER / ADVENTURER (Top-Right Cyan Sky Medallion)
  if (def.artType === 'mountaineer') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="mountRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#4DD0E1" />
              <Stop offset="100%" stopColor="#0097A7" />
            </LinearGradient>
            <LinearGradient id="mountSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="100%" stopColor="#80DEEA" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#mountRim)" stroke="#B2EBF2" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#mountSky)" stroke="#006064" strokeWidth="1.5" />

          {/* Clouds */}
          <Circle cx="30" cy="38" r="8" fill="#FFFFFF" opacity={0.8} />
          <Circle cx="42" cy="35" r="10" fill="#FFFFFF" opacity={0.8} />

          {/* Mountain Peaks with Snow */}
          <Polygon points="16,84 46,44 68,84" fill="#00838F" />
          <Polygon points="46,44 40,54 52,54" fill="#FFFFFF" />

          <Polygon points="44,84 76,48 94,84" fill="#006064" />
          <Polygon points="76,48 70,58 82,58" fill="#FFFFFF" />

          {/* Hiker with Backpack & Red Flag on Peak */}
          <Circle cx="76" cy="36" r="4" fill="#FFB74D" />
          <Rect x="73" y="40" width="6" height="9" rx="2" fill="#0288D1" />
          <Rect x="78" y="40" width="4" height="7" rx="1.5" fill="#FB8C00" />
          {/* Flag */}
          <Path d="M 83 48 L 83 28" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
          <Polygon points="83,28 93,33 83,38" fill="#E53935" />

          {/* Sparkles */}
          {renderSparkle(24, 28, 4)}
        </Svg>
      </View>
    );
  }

  // 6. TACO (Middle-Left Purple Medallion)
  if (def.artType === 'taco') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="tacoRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#7E57C2" />
              <Stop offset="100%" stopColor="#4527A0" />
            </LinearGradient>
            <RadialGradient id="tacoBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#EDE7F6" />
              <Stop offset="100%" stopColor="#D1C4E9" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#tacoRim)" stroke="#B39DDB" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#tacoBg)" stroke="#311B92" strokeWidth="1.5" />

          {/* Taco Shell (Rotated 45-deg crescent) */}
          <G transform="rotate(-20 50 50)">
            {/* Green Lettuce border */}
            <Circle cx="44" cy="40" r="5" fill="#43A047" />
            <Circle cx="50" cy="38" r="6" fill="#4CAF50" />
            <Circle cx="58" cy="38" r="5" fill="#66BB6A" />
            <Circle cx="66" cy="42" r="5" fill="#43A047" />
            {/* Red Tomato Bits */}
            <Circle cx="46" cy="39" r="2.5" fill="#E53935" />
            <Circle cx="56" cy="37" r="3" fill="#F44336" />
            <Circle cx="64" cy="40" r="2.5" fill="#E53935" />
            {/* Golden Taco Shell */}
            <Path d="M 28 54 C 28 32 72 32 72 54 C 72 68 28 68 28 54 Z" fill="#FFB300" />
            <Path d="M 32 54 C 32 38 68 38 68 54 C 68 64 32 64 32 54 Z" fill="#FFC107" />
          </G>

          {/* Sparkles */}
          {renderSparkle(22, 32, 4)}
          {renderSparkle(78, 66, 4)}
        </Svg>
      </View>
    );
  }

  // 7. DESERT SUNSET / CAMEL TRAVELER (Middle-Center Warm Medallion)
  if (def.artType === 'camel_desert') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="camelRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFE082" />
              <Stop offset="100%" stopColor="#FFB300" />
            </LinearGradient>
            <LinearGradient id="sunSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF8A65" />
              <Stop offset="60%" stopColor="#FFB74D" />
              <Stop offset="100%" stopColor="#FFE082" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#camelRim)" stroke="#FFF9C4" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#sunSky)" stroke="#FF8F00" strokeWidth="1.5" />

          {/* Glowing Sunset Sun */}
          <Circle cx="50" cy="38" r="14" fill="#FFF59D" opacity={0.9} />

          {/* Purple Desert Dunes */}
          <Path d="M 14 70 Q 42 54 86 70 L 86 86 L 14 86 Z" fill="#7B1FA2" />
          <Path d="M 14 76 Q 60 62 86 80 L 86 86 L 14 86 Z" fill="#4A148C" />

          {/* Silhouette Camel & Rider */}
          <G transform="translate(36, 44)">
            {/* Camel Body & Humps */}
            <Path d="M 12 18 C 12 14 16 12 20 14 C 23 12 28 12 30 16 C 32 20 28 24 20 24 C 14 24 12 22 12 18 Z" fill="#311B92" />
            {/* Neck & Head */}
            <Path d="M 13 18 L 6 10 C 5 8 8 6 10 7 L 16 14 Z" fill="#311B92" />
            {/* Legs */}
            <Path d="M 13 24 L 11 36 M 16 24 L 16 35 M 24 24 L 26 36 M 28 24 L 30 35" stroke="#311B92" strokeWidth="2" strokeLinecap="round" />
            {/* Rider with Hat */}
            <Circle cx="21" cy="7" r="3" fill="#311B92" />
            <Path d="M 17 8 L 25 8" stroke="#311B92" strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M 21 10 L 21 15" stroke="#311B92" strokeWidth="2" />
          </G>

          {/* Sparkles */}
          {renderSparkle(20, 26, 3.5)}
        </Svg>
      </View>
    );
  }

  // 8. TREASURE CHEST (Middle-Right Coral/Pink Medallion)
  if (def.artType === 'treasure_chest') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="chestRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F48FB1" />
              <Stop offset="100%" stopColor="#C2185B" />
            </LinearGradient>
            <RadialGradient id="chestBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#FCE4EC" />
              <Stop offset="100%" stopColor="#F8BBD0" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#chestRim)" stroke="#F8BBD0" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#chestBg)" stroke="#880E4F" strokeWidth="1.5" />

          {/* Golden Glow radiating from inside */}
          <Polygon points="30,42 50,22 70,42" fill="#FFF59D" opacity={0.6} />

          {/* Open Chest Lid (Tilted Back) */}
          <Polygon points="26,38 74,38 68,26 32,26" fill="#8D6E63" stroke="#FFFFFF" strokeWidth="3" />
          <Polygon points="30,36 70,36 65,28 35,28" fill="#6D4C41" />

          {/* Gold Bars inside */}
          <Rect x="36" y="38" width="28" height="8" rx="2" fill="#FFD54F" />
          <Rect x="40" y="34" width="20" height="6" rx="2" fill="#FFCA28" />

          {/* Chest Base */}
          <Rect x="26" y="44" width="48" height="28" rx="4" fill="#6D4C41" stroke="#FFFFFF" strokeWidth="3" />
          {/* Keyhole Plate */}
          <Circle cx="50" cy="55" r="4.5" fill="#FFFFFF" />
          <Circle cx="50" cy="55" r="2" fill="#212121" />
          <Path d="M 50 56 L 50 60" stroke="#212121" strokeWidth="2" />

          {/* Sparkles */}
          {renderSparkle(20, 32, 4)}
          {renderSparkle(80, 30, 4.5)}
        </Svg>
      </View>
    );
  }

  // 9. CITY SKYLINE / SKYSCRAPERS (Bottom-Center Green Medallion)
  if (def.artType === 'city_skyline') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="cityRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#66BB6A" />
              <Stop offset="100%" stopColor="#2E7D32" />
            </LinearGradient>
            <LinearGradient id="citySky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="100%" stopColor="#B2DFDB" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#cityRim)" stroke="#A5D6A7" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#citySky)" stroke="#1B5E20" strokeWidth="1.5" />

          {/* Clouds */}
          <Circle cx="32" cy="38" r="8" fill="#FFFFFF" opacity={0.9} />
          <Circle cx="44" cy="36" r="10" fill="#FFFFFF" opacity={0.9} />

          {/* Skyscraper Buildings (Isometric Blue-White Glass) */}
          <G transform="rotate(-15 50 50)">
            {/* Center Skyscraper */}
            <Polygon points="42,24 58,24 58,74 42,74" fill="#FFFFFF" />
            <Polygon points="58,24 68,30 68,74 58,74" fill="#B2EBF2" />
            <Path d="M 50 14 L 50 24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Windows */}
            <Rect x="46" y="32" width="3" height="3" fill="#00838F" />
            <Rect x="52" y="32" width="3" height="3" fill="#00838F" />
            <Rect x="46" y="40" width="3" height="3" fill="#00838F" />
            <Rect x="52" y="40" width="3" height="3" fill="#00838F" />
            <Rect x="46" y="48" width="3" height="3" fill="#00838F" />
            <Rect x="52" y="48" width="3" height="3" fill="#00838F" />
            {/* Right Tower */}
            <Polygon points="64,36 78,36 78,74 64,74" fill="#E0F7FA" />
            <Polygon points="78,36 84,40 84,74 78,74" fill="#80DEEA" />
            {/* Left Tower */}
            <Polygon points="26,44 40,44 40,74 26,74" fill="#E0F2F1" />
          </G>

          {/* Sparkles */}
          {renderSparkle(22, 28, 4)}
        </Svg>
      </View>
    );
  }

  // 10. CRYSTAL HEXAGON 25 (Bottom-Right Blue Hexagon)
  if (def.artType === 'hexagon_25') {
    const num = def.customNumber || '25';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="hex25Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#90CAF9" />
              <Stop offset="50%" stopColor="#42A5F5" />
              <Stop offset="100%" stopColor="#1565C0" />
            </LinearGradient>
            <LinearGradient id="hex25Bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E3F2FD" />
              <Stop offset="100%" stopColor="#BBDEFB" />
            </LinearGradient>
          </Defs>

          {/* Outer Beveled Hexagon */}
          <Polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#hex25Rim)" stroke="#BBDEFB" strokeWidth="2" />

          {/* Top Bevel Highlight */}
          <Polygon points="50,3 91,26 80,32 50,15 20,32 9,26" fill="#FFFFFF" opacity={0.45} />
          {/* Bottom Bevel Shadow */}
          <Polygon points="50,97 91,74 80,68 50,85 20,68 9,74" fill="#0D47A1" opacity={0.35} />

          {/* Inner Recessed Hexagon Canvas */}
          <Polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="url(#hex25Bg)" stroke="#1976D2" strokeWidth="1.5" />

          {/* Bold 3D White Numeral */}
          <SvgText x="50" y={num.length > 2 ? 61 : 64} textAnchor="middle" fontSize={num.length > 2 ? 32 : 38} fontWeight="900" fill="#0D47A1">
            {num}
          </SvgText>
          <SvgText x="50" y={num.length > 2 ? 58 : 61} textAnchor="middle" fontSize={num.length > 2 ? 32 : 38} fontWeight="900" fill="#FFFFFF">
            {num}
          </SvgText>

          {/* Sparkles */}
          {renderSparkle(16, 26, 4.5)}
          {renderSparkle(84, 24, 3.5)}
          {renderSparkle(50, 93, 4)}
        </Svg>
      </View>
    );
  }

  // 11. CRYSTAL HEXAGON 50 (Bottom-Right Slate/Silver Hexagon)
  if (def.artType === 'hexagon_50') {
    const num = def.customNumber || '50';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="hex50Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#CFD8DC" />
              <Stop offset="50%" stopColor="#78909C" />
              <Stop offset="100%" stopColor="#37474F" />
            </LinearGradient>
            <LinearGradient id="hex50Bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ECEFF1" />
              <Stop offset="100%" stopColor="#CFD8DC" />
            </LinearGradient>
          </Defs>

          <Polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#hex50Rim)" stroke="#ECEFF1" strokeWidth="2" />

          {/* Top Bevel Highlight */}
          <Polygon points="50,3 91,26 80,32 50,15 20,32 9,26" fill="#FFFFFF" opacity={0.5} />
          {/* Bottom Bevel Shadow */}
          <Polygon points="50,97 91,74 80,68 50,85 20,68 9,74" fill="#263238" opacity={0.35} />

          {/* Inner Recessed Hexagon Canvas */}
          <Polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="url(#hex50Bg)" stroke="#455A64" strokeWidth="1.5" />

          {/* Bold 3D White Numeral */}
          <SvgText x="50" y={num.length > 2 ? 61 : 64} textAnchor="middle" fontSize={num.length > 2 ? 32 : 38} fontWeight="900" fill="#263238">
            {num}
          </SvgText>
          <SvgText x="50" y={num.length > 2 ? 58 : 61} textAnchor="middle" fontSize={num.length > 2 ? 32 : 38} fontWeight="900" fill="#FFFFFF">
            {num}
          </SvgText>

          {/* Sparkles */}
          {renderSparkle(16, 26, 4.5)}
          {renderSparkle(84, 24, 3.5)}
          {renderSparkle(50, 93, 4)}
        </Svg>
      </View>
    );
  }

  // 12. GOLD OCTAGON 100 (Bottom-Right Beveled Gold Octagon)
  if (def.artType === 'octagon_100') {
    const num = def.customNumber || '100';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="oct100Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFF59D" />
              <Stop offset="30%" stopColor="#FFD54F" />
              <Stop offset="70%" stopColor="#FFB300" />
              <Stop offset="100%" stopColor="#FF8F00" />
            </LinearGradient>
            <RadialGradient id="oct100Bg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#FFE082" />
              <Stop offset="100%" stopColor="#FF8F00" />
            </RadialGradient>
          </Defs>

          {/* Outer 8-sided Beveled Coin */}
          <Polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="url(#oct100Rim)" stroke="#FFE57F" strokeWidth="3" />

          {/* Top Highlight Facets */}
          <Polygon points="30,4 70,4 63,15 37,15" fill="#FFFFFF" opacity={0.5} />
          <Polygon points="4,30 30,4 37,15 15,37" fill="#FFFFFF" opacity={0.4} />

          {/* Bottom Shadow Facets */}
          <Polygon points="30,96 70,96 63,85 37,85" fill="#E65100" opacity={0.35} />
          <Polygon points="96,70 70,96 63,85 85,63" fill="#E65100" opacity={0.3} />

          {/* Inner Recessed Octagon */}
          <Polygon points="37,15 63,15 85,37 85,63 63,85 37,85 15,63 15,37" fill="url(#oct100Bg)" stroke="#FF6F00" strokeWidth="2" />

          {/* Rotated 3D Bold White 100 Numeral */}
          <G transform="rotate(-25 50 50)">
            <SvgText x="50" y="62" textAnchor="middle" fontSize="32" fontWeight="900" fill="#E65100">
              {num}
            </SvgText>
            <SvgText x="50" y="59" textAnchor="middle" fontSize="32" fontWeight="900" fill="#FFFFFF">
              {num}
            </SvgText>
          </G>

          {/* Sparkles */}
          {renderSparkle(12, 28, 5)}
          {renderSparkle(88, 26, 4)}
          {renderSparkle(28, 92, 4.5)}
          {renderSparkle(74, 90, 3.5)}
        </Svg>
      </View>
    );
  }

  // 13. CONFETTI / CELEBRATION PARTY (Far Bottom-Right Purple Medallion)
  if (def.artType === 'celebration_party') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="partyRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#9575CD" />
              <Stop offset="100%" stopColor="#512DA8" />
            </LinearGradient>
            <RadialGradient id="partyBg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#EDE7F6" />
              <Stop offset="100%" stopColor="#D1C4E9" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#partyRim)" stroke="#D1C4E9" strokeWidth="2" />
          <Circle cx="50" cy="50" r="36" fill="url(#partyBg)" stroke="#311B92" strokeWidth="1.5" />

          {/* Colorful Confetti Pieces */}
          <Rect x="44" y="24" width="4" height="4" rx="1" fill="#E91E63" transform="rotate(20 44 24)" />
          <Rect x="58" y="28" width="5" height="3" rx="1" fill="#FFEB3B" transform="rotate(-30 58 28)" />
          <Rect x="34" y="34" width="4" height="4" rx="1" fill="#2196F3" transform="rotate(45 34 34)" />
          <Rect x="64" y="36" width="3" height="5" rx="1" fill="#4CAF50" transform="rotate(15 64 36)" />
          <Circle cx="50" cy="32" r="2.5" fill="#FF9800" />

          {/* Cheering Raised Hands */}
          <Path d="M 32 84 L 40 60 L 46 64 L 40 84 Z" fill="#FFB74D" />
          <Path d="M 68 84 L 60 60 L 54 64 L 60 84 Z" fill="#FFB74D" />
          {/* Party Poppers */}
          <Polygon points="40,60 36,52 44,56" fill="#E91E63" />
          <Polygon points="60,60 64,52 56,56" fill="#2196F3" />

          {/* Sparkles */}
          {renderSparkle(22, 26, 4)}
          {renderSparkle(78, 24, 4)}
        </Svg>
      </View>
    );
  }

  // 14. GIANT GOLD STAR SHIELD (Bottom-Left Golden Beveled Octagon)
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="starOctRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFF59D" />
            <Stop offset="30%" stopColor="#FFD54F" />
            <Stop offset="70%" stopColor="#FFB300" />
            <Stop offset="100%" stopColor="#FF8F00" />
          </LinearGradient>
          <RadialGradient id="starOctBg" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FF9800" />
            <Stop offset="100%" stopColor="#E65100" />
          </RadialGradient>
        </Defs>

        {/* Outer 8-sided Beveled Octagon */}
        <Polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="url(#starOctRim)" stroke="#FFE57F" strokeWidth="3" />

        {/* Top Highlight Bevels */}
        <Polygon points="30,4 70,4 63,15 37,15" fill="#FFFFFF" opacity={0.5} />
        <Polygon points="4,30 30,4 37,15 15,37" fill="#FFFFFF" opacity={0.4} />

        {/* Bottom Shadow Bevels */}
        <Polygon points="30,96 70,96 63,85 37,85" fill="#BF360C" opacity={0.35} />
        <Polygon points="96,70 70,96 63,85 85,63" fill="#BF360C" opacity={0.3} />

        {/* Inner Glowing Orange-Amber Field */}
        <Polygon points="37,15 63,15 85,37 85,63 63,85 37,85 15,63 15,37" fill="url(#starOctBg)" stroke="#BF360C" strokeWidth="2" />

        {/* Giant 3D Faceted 5-Point Star */}
        {/* Drop shadow */}
        <Path
          d="M 50 18 L 59 38 L 81 40 L 65 56 L 70 78 L 50 67 L 30 78 L 35 56 L 19 40 L 41 38 Z"
          fill="#BF360C"
          transform="translate(3, 4)"
          opacity={0.6}
        />
        {/* Left Facets (Bright Light Gold) */}
        <Path d="M 50 18 L 50 52 L 41 38 Z" fill="#FFF9C4" />
        <Path d="M 50 52 L 50 67 L 30 78 Z" fill="#FFF176" />
        <Path d="M 50 52 L 19 40 L 35 56 Z" fill="#FFF9C4" />
        <Path d="M 50 52 L 35 56 L 30 78 Z" fill="#FFEE58" />
        <Path d="M 50 18 L 50 52 L 59 38 Z" fill="#FFEE58" />
        {/* Right Facets (Dark Gold Amber) */}
        <Path d="M 50 52 L 81 40 L 59 38 Z" fill="#FDD835" />
        <Path d="M 50 52 L 65 56 L 81 40 Z" fill="#FBC02D" />
        <Path d="M 50 52 L 70 78 L 65 56 Z" fill="#F57F17" />
        <Path d="M 50 52 L 50 67 L 70 78 Z" fill="#FBC02D" />

        {/* Sparkles radiating around badge */}
        {renderSparkle(12, 28, 5.5)}
        {renderSparkle(88, 24, 4.5)}
        {renderSparkle(26, 92, 5)}
        {renderSparkle(78, 88, 4)}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
