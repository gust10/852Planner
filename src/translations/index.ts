export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Main Page
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': 'Your intelligent travel companion',
    'main.cta': 'Start Your Journey',
    
    // Survey Page
    'survey.title': 'Tell Us About Your Trip',
    'survey.subtitle': 'Help us create the perfect Hong Kong experience for you',
    'survey.next': 'Next',
    'survey.back': 'Back',
    'survey.submit': 'Create My Itinerary',
    'survey.progress': 'Question {current} of {total}',
    
    // Travel Dates
    'survey.dates.question': 'When are you visiting Hong Kong?',
    'survey.dates.start': 'Start Date',
    'survey.dates.end': 'End Date',
    'survey.dates.placeholder': 'Select date',
    'survey.dates.select': 'Select your travel dates',
    'survey.dates.selected': 'Selected dates:',
    'survey.dates.selectEnd': '(select end date)',
    
    // Daily Hours
    'survey.time.question': 'What are your daily hours?',
    'survey.time.hours': '{hours} hours of exploration',
    
    // Travel Party
    'survey.party.question': 'Who are you traveling with?',
    'survey.party.solo': 'Solo Travel',
    'survey.party.couple': 'As a Couple',
    'survey.party.family': 'Family with Kids',
    'survey.party.friends': 'Group of Friends',
    'survey.party.business': 'Business Trip',
    'survey.party.total': 'Total number of people',
    'survey.party.family.hint': 'Including adults and children',
    'survey.party.friends.hint': 'Total number in your group',
    
    // Interests
    'survey.interests.question': 'What interests you most?',
    'survey.interests.culture': 'Culture & Heritage',
    'survey.interests.food': 'Food & Dining',
    'survey.interests.shopping': 'Shopping',
    'survey.interests.nature': 'Nature & Parks',
    'survey.interests.nightlife': 'Nightlife',
    'survey.interests.adventure': 'Adventure Activities',
    'survey.interests.relaxation': 'Relaxation & Wellness',
    'survey.interests.photography': 'Photography Spots',
    'survey.interests.max': 'Choose up to 3 interests',
    
    // Budget
    'survey.budget.question': 'What is your budget range?',
    'survey.budget.low': 'Budget-friendly (Under $50/day)',
    'survey.budget.mid': 'Moderate ($50-150/day)',
    'survey.budget.high': 'Premium ($150-300/day)',
    'survey.budget.luxury': 'Luxury ($300+/day)',
    'survey.budget.placeholder': 'Enter total budget (USD)',
    'survey.budget.daily': 'Daily Budget',
    'survey.budget.forDays': 'for {days} days',
    
    // Accommodation
    'survey.accommodation.question': 'What type of accommodation do you prefer?',
    'survey.accommodation.hostel': 'Hostel/Budget',
    'survey.accommodation.hotel': 'Standard Hotel',
    'survey.accommodation.boutique': 'Boutique Hotel',
    'survey.accommodation.luxury': 'Luxury Resort',
    'survey.accommodation.apartment': 'Apartment/Airbnb',
    
    // Other Pages
    'weather.title': 'Weather Information',
    'landmarks.title': 'Select Popular Landmarks',
    'landmarks.optional': 'Select landmarks you\'d like to visit (optional)',
    'itinerary.title': 'Your Itinerary',
    'notfound.title': '404 - Page Not Found',
    'notfound.description': 'The page you are looking for does not exist.',
    'notfound.back': 'Back to Home',
    
    // Food Preferences
    'survey.food.cuisine': 'Cuisine Interests (optional)',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    
    // User Menu
    'auth.signIn': 'Sign In',
    'auth.account': 'Account',
    'auth.myItineraries': 'My Itineraries',
    'auth.signOut': 'Sign out',
  },
  
  zh: {
    // 主頁面
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': '您的智能旅行夥伴',
    'main.cta': '開始您的旅程',
    
    // Survey Page
    'survey.title': '告訴我們您的旅程',
    'survey.subtitle': '幫助我們為您打造完美的香港體驗',
    'survey.next': '下一步',
    'survey.back': '返回',
    'survey.submit': '創建我的行程',
    'survey.progress': '第 {current} 題，共 {total} 題',
    
    // Travel Dates
    'survey.dates.question': '您什麼時候訪問香港？',
    'survey.dates.start': '開始日期',
    'survey.dates.end': '結束日期',
    'survey.dates.placeholder': '選擇日期',
    'survey.dates.select': '選擇您的旅行日期',
    'survey.dates.selected': '已選日期：',
    'survey.dates.selectEnd': '（選擇結束日期）',
    
    // Daily Hours
    'survey.time.question': '您的每日時段是？',
    'survey.time.hours': '{hours} 小時探索',
    
    // Travel Party
    'survey.party.question': '您與誰一起旅行？',
    'survey.party.solo': '獨自旅行',
    'survey.party.couple': '情侶出行',
    'survey.party.family': '家庭親子',
    'survey.party.friends': '朋友聚會',
    'survey.party.business': '商務出差',
    'survey.party.total': '總人數',
    'survey.party.family.hint': '包括大人和小孩',
    'survey.party.friends.hint': '團體總人數',
    
    // Interests
    'survey.interests.question': '您最感興趣的是什麼？',
    'survey.interests.culture': '文化與遺產',
    'survey.interests.food': '美食與餐飲',
    'survey.interests.shopping': '購物',
    'survey.interests.nature': '自然與公園',
    'survey.interests.nightlife': '夜生活',
    'survey.interests.adventure': '冒險活動',
    'survey.interests.relaxation': '放鬆與養生',
    'survey.interests.photography': '攝影景點',
    'survey.interests.max': '最多選擇 3 項興趣',
    
    // Budget
    'survey.budget.question': '您的預算範圍是？',
    'survey.budget.low': '經濟實惠 (每日少於$50)',
    'survey.budget.mid': '適中 (每日$50-150)',
    'survey.budget.high': '高級 (每日$150-300)',
    'survey.budget.luxury': '奢華 (每日$300+)',
    'survey.budget.placeholder': '輸入總預算（美元）',
    'survey.budget.daily': '每日預算',
    'survey.budget.forDays': '共 {days} 天',
    
    // Accommodation
    'survey.accommodation.question': '您喜歡什麼類型的住宿？',
    'survey.accommodation.hostel': '青年旅舍/經濟型',
    'survey.accommodation.hotel': '標準酒店',
    'survey.accommodation.boutique': '精品酒店',
    'survey.accommodation.luxury': '豪華度假村',
    'survey.accommodation.apartment': '公寓/民宿',
    
    // Other Pages
    'weather.title': '天氣資訊',
    'landmarks.title': '選擇熱門地標',
    'landmarks.optional': '選擇您想參觀的地標（可選）',
    'itinerary.title': '您的行程',
    'notfound.title': '404 - 找不到頁面',
    'notfound.description': '您尋找的頁面不存在。',
    'notfound.back': '返回首頁',
    
    // Food Preferences
    'survey.food.cuisine': '美食興趣（可選）',
    
    // Common
    'common.loading': '載入中...',
    'common.error': '出現錯誤',
    'common.retry': '重試',
    
    // User Menu
    'auth.signIn': '登入',
    'auth.account': '帳戶',
    'auth.myItineraries': '我的行程',
    'auth.signOut': '登出',
  },
  
  ja: {
    // メインページ
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': 'あなたのインテリジェント旅行コンパニオン',
    'main.cta': '旅を始める',
    
    // Survey Page
    'survey.title': 'あなたの旅行について教えてください',
    'survey.subtitle': '完璧な香港体験をお作りします',
    'survey.next': '次へ',
    'survey.back': '戻る',
    'survey.submit': '旅程を作成',
    'survey.progress': '質問 {current} / {total}',
    
    // Travel Dates
    'survey.dates.question': 'いつ香港を訪問されますか？',
    'survey.dates.start': '開始日',
    'survey.dates.end': '終了日',
    'survey.dates.placeholder': '日付を選択',
    'survey.dates.select': '旅行日付を選択してください',
    'survey.dates.selected': '選択された日付：',
    'survey.dates.selectEnd': '（終了日を選択）',
    
    // Daily Hours
    'survey.time.question': '1日の時間帯は？',
    'survey.time.hours': '{hours}時間の探索',
    
    // Travel Party
    'survey.party.question': '誰と一緒に旅行されますか？',
    'survey.party.solo': '一人旅',
    'survey.party.couple': 'カップル',
    'survey.party.family': '家族（子供あり）',
    'survey.party.friends': '友人グループ',
    'survey.party.business': '出張',
    'survey.party.total': '総人数',
    'survey.party.family.hint': '大人と子供を含む',
    'survey.party.friends.hint': 'グループの総人数',
    
    // Interests
    'survey.interests.question': '最も興味があるものは？',
    'survey.interests.culture': '文化・遺産',
    'survey.interests.food': 'グルメ・ダイニング',
    'survey.interests.shopping': 'ショッピング',
    'survey.interests.nature': '自然・公園',
    'survey.interests.nightlife': 'ナイトライフ',
    'survey.interests.adventure': 'アドベンチャー活動',
    'survey.interests.relaxation': 'リラクゼーション・ウェルネス',
    'survey.interests.photography': '撮影スポット',
    'survey.interests.max': '最大3つまで選択',
    
    // Budget
    'survey.budget.question': '予算範囲は？',
    'survey.budget.low': 'バジェット（1日$50未満）',
    'survey.budget.mid': 'モデレート（1日$50-150）',
    'survey.budget.high': 'プレミアム（1日$150-300）',
    'survey.budget.luxury': 'ラグジュアリー（1日$300+）',
    'survey.budget.placeholder': '総予算を入力（USD）',
    'survey.budget.daily': '1日あたりの予算',
    'survey.budget.forDays': '{days}日間',
    
    // Accommodation
    'survey.accommodation.question': 'どのような宿泊施設をお好みですか？',
    'survey.accommodation.hostel': 'ホステル/バジェット',
    'survey.accommodation.hotel': 'スタンダードホテル',
    'survey.accommodation.boutique': 'ブティックホテル',
    'survey.accommodation.luxury': 'ラグジュアリーリゾート',
    'survey.accommodation.apartment': 'アパート/民泊',
    
    // Other Pages
    'weather.title': '天気情報',
    'landmarks.title': '人気ランドマークを選択',
    'landmarks.optional': '訪れたいランドマークを選択（任意）',
    'itinerary.title': 'あなたの旅程',
    'notfound.title': '404 - ページが見つかりません',
    'notfound.description': 'お探しのページは存在しません。',
    'notfound.back': 'ホームに戻る',
    
    // Food Preferences
    'survey.food.cuisine': '料理の興味（任意）',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.retry': '再試行',
    
    // User Menu
    'auth.signIn': 'サインイン',
    'auth.account': 'アカウント',
    'auth.myItineraries': 'マイ旅程',
    'auth.signOut': 'サインアウト',
  },
  
  ko: {
    // 메인 페이지
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': '당신의 지능형 여행 동반자',
    'main.cta': '여행 시작하기',
    
    // Survey Page
    'survey.title': '여행에 대해 알려주세요',
    'survey.subtitle': '완벽한 홍콩 경험을 만들어 드립니다',
    'survey.next': '다음',
    'survey.back': '이전',
    'survey.submit': '여행 계획 만들기',
    'survey.progress': '질문 {current} / {total}',
    
    // Travel Dates
    'survey.dates.question': '홍콩을 언제 방문하시나요？',
    'survey.dates.start': '시작 날짜',
    'survey.dates.end': '종료 날짜',
    'survey.dates.placeholder': '날짜 선택',
    'survey.dates.select': '여행 날짜를 선택하세요',
    'survey.dates.selected': '선택된 날짜:',
    'survey.dates.selectEnd': '（종료 날짜 선택）',
    
    // Daily Hours
    'survey.time.question': '일일 시간대는？',
    'survey.time.hours': '{hours}시간 탐험',
    
    // Travel Party
    'survey.party.question': '누구와 함께 여행하시나요？',
    'survey.party.solo': '혼자 여행',
    'survey.party.couple': '커플 여행',
    'survey.party.family': '가족 여행 (아이 동반)',
    'survey.party.friends': '친구들과',
    'survey.party.business': '출장',
    'survey.party.total': '총 인원',
    'survey.party.family.hint': '성인과 어린이 포함',
    'survey.party.friends.hint': '그룹 총 인원',
    
    // Interests
    'survey.interests.question': '가장 관심 있는 것은？',
    'survey.interests.culture': '문화 & 유산',
    'survey.interests.food': '음식 & 다이닝',
    'survey.interests.shopping': '쇼핑',
    'survey.interests.nature': '자연 & 공원',
    'survey.interests.nightlife': '나이트라이프',
    'survey.interests.adventure': '모험 활동',
    'survey.interests.relaxation': '휴식 & 웰니스',
    'survey.interests.photography': '사진 명소',
    'survey.interests.max': '최대 3개까지 선택',
    
    // Budget
    'survey.budget.question': '예산 범위는？',
    'survey.budget.low': '저예산 (하루 $50 미만)',
    'survey.budget.mid': '보통 (하루 $50-150)',
    'survey.budget.high': '프리미엄 (하루 $150-300)',
    'survey.budget.luxury': '럭셔리 (하루 $300+)',
    'survey.budget.placeholder': '총 예산 입력 (USD)',
    'survey.budget.daily': '일일 예산',
    'survey.budget.forDays': '{days}일 동안',
    
    // Accommodation
    'survey.accommodation.question': '어떤 숙박시설을 선호하시나요？',
    'survey.accommodation.hostel': '호스텔/저예산',
    'survey.accommodation.hotel': '일반 호텔',
    'survey.accommodation.boutique': '부티크 호텔',
    'survey.accommodation.luxury': '럭셔리 리조트',
    'survey.accommodation.apartment': '아파트/에어비앤비',
    
    // Other Pages
    'weather.title': '날씨 정보',
    'landmarks.title': '인기 명소 선택',
    'landmarks.optional': '방문하고 싶은 명소를 선택하세요 (선택사항)',
    'itinerary.title': '당신의 여행 계획',
    'notfound.title': '404 - 페이지를 찾을 수 없습니다',
    'notfound.description': '찾으시는 페이지가 존재하지 않습니다.',
    'notfound.back': '홈으로 돌아가기',
    
    // Food Preferences
    'survey.food.cuisine': '음식 취향 (선택사항)',
    
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.retry': '다시 시도',
    
    // User Menu
    'auth.signIn': '로그인',
    'auth.account': '계정',
    'auth.myItineraries': '내 여행 계획',
    'auth.signOut': '로그아웃',
  },
  
  es: {
    // Main Page
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': 'Su compañero inteligente de viajes',
    'main.cta': 'Comenzar Su Viaje',
    
    // Survey Page
    'survey.title': 'Cuéntenos Sobre Su Viaje',
    'survey.subtitle': 'Ayúdenos a crear la experiencia perfecta de Hong Kong para usted',
    'survey.next': 'Siguiente',
    'survey.back': 'Atrás',
    'survey.submit': 'Crear Mi Itinerario',
    'survey.progress': 'Pregunta {current} de {total}',
    
    // Travel Dates
    'survey.dates.question': '¿Cuándo visitará Hong Kong?',
    'survey.dates.start': 'Fecha de Inicio',
    'survey.dates.end': 'Fecha de Final',
    'survey.dates.placeholder': 'Seleccionar fecha',
    'survey.dates.select': 'Seleccione sus fechas de viaje',
    'survey.dates.selected': 'Fechas seleccionadas:',
    'survey.dates.selectEnd': '(seleccionar fecha final)',
    
    // Daily Hours
    'survey.time.question': '¿Cuáles son sus horas diarias?',
    'survey.time.hours': '{hours} horas de exploración',
    
    // Travel Party
    'survey.party.question': '¿Con quién viaja?',
    'survey.party.solo': 'Viaje Solo',
    'survey.party.couple': 'En Pareja',
    'survey.party.family': 'Familia con Niños',
    'survey.party.friends': 'Grupo de Amigos',
    'survey.party.business': 'Viaje de Negocios',
    'survey.party.total': 'Número total de personas',
    'survey.party.family.hint': 'Incluyendo adultos y niños',
    'survey.party.friends.hint': 'Número total en el grupo',
    
    // Interests
    'survey.interests.question': '¿Qué le interesa más?',
    'survey.interests.culture': 'Cultura y Patrimonio',
    'survey.interests.food': 'Comida y Restaurantes',
    'survey.interests.shopping': 'Compras',
    'survey.interests.nature': 'Naturaleza y Parques',
    'survey.interests.nightlife': 'Vida Nocturna',
    'survey.interests.adventure': 'Actividades de Aventura',
    'survey.interests.relaxation': 'Relajación y Bienestar',
    'survey.interests.photography': 'Lugares Fotográficos',
    'survey.interests.max': 'Elija hasta 3 intereses',
    
    // Budget
    'survey.budget.question': '¿Cuál es su rango de presupuesto?',
    'survey.budget.low': 'Económico (Menos de $50/día)',
    'survey.budget.mid': 'Moderado ($50-150/día)',
    'survey.budget.high': 'Premium ($150-300/día)',
    'survey.budget.luxury': 'Lujo ($300+/día)',
    'survey.budget.placeholder': 'Ingrese presupuesto total (USD)',
    'survey.budget.daily': 'Presupuesto Diario',
    'survey.budget.forDays': 'por {days} días',
    
    // Accommodation
    'survey.accommodation.question': '¿Qué tipo de alojamiento prefiere?',
    'survey.accommodation.hostel': 'Hostal/Económico',
    'survey.accommodation.hotel': 'Hotel Estándar',
    'survey.accommodation.boutique': 'Hotel Boutique',
    'survey.accommodation.luxury': 'Resort de Lujo',
    'survey.accommodation.apartment': 'Apartamento/Airbnb',
    
    // Other Pages
    'weather.title': 'Información del Tiempo',
    'landmarks.title': 'Seleccionar Lugares Populares',
    'landmarks.optional': 'Seleccione lugares de interés que le gustaría visitar (opcional)',
    'itinerary.title': 'Su Itinerario',
    'notfound.title': '404 - Página No Encontrada',
    'notfound.description': 'La página que busca no existe.',
    'notfound.back': 'Volver al Inicio',
    
    // Food Preferences
    'survey.food.cuisine': 'Intereses Culinarios (opcional)',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Algo salió mal',
    'common.retry': 'Intentar Nuevamente',
    
    // User Menu
    'auth.signIn': 'Iniciar sesión',
    'auth.account': 'Cuenta',
    'auth.myItineraries': 'Mis itinerarios',
    'auth.signOut': 'Cerrar sesión',
  },
  
  fr: {
    // Main Page
    'main.title': '852Planner',
    'main.subtitle': '',
    'main.description': 'Votre compagnon de voyage intelligent',
    'main.cta': 'Commencer Votre Voyage',
    
    // Survey Page
    'survey.title': 'Parlez-nous de Votre Voyage',
    'survey.subtitle': 'Aidez-nous à créer l\'expérience parfaite de Hong Kong pour vous',
    'survey.next': 'Suivant',
    'survey.back': 'Retour',
    'survey.submit': 'Créer Mon Itinéraire',
    'survey.progress': 'Question {current} sur {total}',
    
    // Travel Dates
    'survey.dates.question': 'Quand visitez-vous Hong Kong ?',
    'survey.dates.start': 'Date de Début',
    'survey.dates.end': 'Date de Fin',
    'survey.dates.placeholder': 'Sélectionner une date',
    'survey.dates.select': 'Sélectionnez vos dates de voyage',
    'survey.dates.selected': 'Dates sélectionnées :',
    'survey.dates.selectEnd': '(sélectionner date de fin)',
    
    // Daily Hours
    'survey.time.question': 'Quelles sont vos heures quotidiennes ?',
    'survey.time.hours': '{hours} heures d\'exploration',
    
    // Travel Party
    'survey.party.question': 'Avec qui voyagez-vous ?',
    'survey.party.solo': 'Voyage Solo',
    'survey.party.couple': 'En Couple',
    'survey.party.family': 'Famille avec Enfants',
    'survey.party.friends': 'Groupe d\'Amis',
    'survey.party.business': 'Voyage d\'Affaires',
    'survey.party.total': 'Nombre total de personnes',
    'survey.party.family.hint': 'Y compris adultes et enfants',
    'survey.party.friends.hint': 'Nombre total dans le groupe',
    
    // Interests
    'survey.interests.question': 'Qu\'est-ce qui vous intéresse le plus ?',
    'survey.interests.culture': 'Culture et Patrimoine',
    'survey.interests.food': 'Nourriture et Restaurants',
    'survey.interests.shopping': 'Shopping',
    'survey.interests.nature': 'Nature et Parcs',
    'survey.interests.nightlife': 'Vie Nocturne',
    'survey.interests.adventure': 'Activités d\'Aventure',
    'survey.interests.relaxation': 'Détente et Bien-être',
    'survey.interests.photography': 'Sites Photographiques',
    'survey.interests.max': 'Choisissez jusqu\'à 3 intérêts',
    
    // Budget
    'survey.budget.question': 'Quelle est votre gamme de budget ?',
    'survey.budget.low': 'Économique (Moins de $50/jour)',
    'survey.budget.mid': 'Modéré ($50-150/jour)',
    'survey.budget.high': 'Premium ($150-300/jour)',
    'survey.budget.luxury': 'Luxe ($300+/jour)',
    'survey.budget.placeholder': 'Entrez le budget total (USD)',
    'survey.budget.daily': 'Budget Journalier',
    'survey.budget.forDays': 'pour {days} jours',
    
    // Accommodation
    'survey.accommodation.question': 'Quel type d\'hébergement préférez-vous ?',
    'survey.accommodation.hostel': 'Auberge/Budget',
    'survey.accommodation.hotel': 'Hôtel Standard',
    'survey.accommodation.boutique': 'Hôtel Boutique',
    'survey.accommodation.luxury': 'Resort de Luxe',
    'survey.accommodation.apartment': 'Appartement/Airbnb',
    
    // Other Pages
    'weather.title': 'Informations Météo',
    'landmarks.title': 'Sélectionner Sites Populaires',
    'landmarks.optional': 'Sélectionnez les sites que vous aimeriez visiter (optionnel)',
    'itinerary.title': 'Votre Itinéraire',
    'notfound.title': '404 - Page Non Trouvée',
    'notfound.description': 'La page que vous cherchez n\'existe pas.',
    'notfound.back': 'Retour à l\'Accueil',
    
    // Food Preferences
    'survey.food.cuisine': 'Intérêts Culinaires (optionnel)',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Quelque chose s\'est mal passé',
    'common.retry': 'Réessayer',
    
    // User Menu
    'auth.signIn': 'Se connecter',
    'auth.account': 'Compte',
    'auth.myItineraries': 'Mes itinéraires',
    'auth.signOut': 'Se déconnecter',
  },
};
