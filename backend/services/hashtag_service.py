import re
from typing import List, Dict, Set, Optional

# Domain-specific hashtag knowledge base
PLATFORM_HASHTAGS = {
    "instagram": ["#InstaDaily", "#PhotoOfTheDay", "#ContentCreator", "#ExplorePage", "#VisualVibes"],
    "linkedin": ["#ProfessionalGrowth", "#Leadership", "#Innovation", "#BrandStrategy", "#FutureOfWork"],
    "twitter": ["#TrendingNow", "#TechLife", "#CreatorEconomy", "#Inspiration", "#DailyThread"],
    "facebook": ["#CommunityFirst", "#ConnectingPeople", "#DailyStory", "#MomentsThatMatter"],
    "blog": ["#BlogPost", "#ContentStrategy", "#LongFormContent", "#DigitalPublishing"],
    "advertisement": ["#SpecialOffer", "#LimitedEdition", "#ShopNow", "#BrandStory", "#NewArrivals"],
    "general": ["#VisualStorytelling", "#CreativeCommunity", "#AIEra", "#ModernLife"]
}

STYLE_HASHTAGS = {
    "creative": ["#ArtOfVisuals", "#CreativeFlow", "#VisualAtmosphere", "#Wanderlust", "#AestheticFeed"],
    "professional": ["#ExcellenceInMotion", "#StrategicVision", "#BusinessImpact", "#IndustryInsights"],
    "casual": ["#GoodVibesOnly", "#RealLifeMoments", "#WeekendMood", "#SimplePleasures"],
    "funny": ["#HumorDaily", "#RelatableContent", "#LaughOutLoud", "#MoodCheck"],
    "inspirational": ["#DreamBig", "#LimitlessPotential", "#RiseAndShine", "#MindsetMatters"],
    "promotional": ["#DiscoverMore", "#UpgradeYourLife", "#ExclusiveDeal", "#TopPick"],
    "minimal": ["#MinimalMood", "#CleanLines", "#SubtleElegance", "#LessIsMore"],
    "storytelling": ["#TalesInFrames", "#BehindTheScenes", "#LifeInStories", "#Chronicles"]
}

DOMAIN_HASHTAGS = {
    "professional_portrait": [
        "#ProfessionalGrowth", "#ExecutivePresence", "#CareerMilestones", "#Leadership",
        "#OpenToWork", "#CareerOpportunities", "#BusinessLeaders", "#Networking", "#PersonalBranding"
    ],
    "fashion_apparel": [
        "#FashionStyle", "#OOTD", "#Couture", "#EveningGown", "#StyleInspo",
        "#ModernElegance", "#DesignerFashion", "#WardrobeEssentials", "#FashionForward"
    ],
    "nature_landscape": [
        "#NaturePhotography", "#WildernessCulture", "#PeakViews", "#MountainLife",
        "#EarthCapture", "#LandscapeLovers", "#ScenicView", "#Outdoors"
    ],
    "travel_heritage": [
        "#TravelDiaries", "#SpiritualJourney", "#SacredPlaces", "#CulturalHeritage",
        "#Wanderlust", "#IncrediblePlaces", "#ExploreTheWorld", "#HistoricVibes"
    ],
    "urban_architecture": [
        "#ArchitectureLovers", "#ModernDesign", "#UrbanLandscape", "#StructuralArt",
        "#CityArchitecture", "#Perspective", "#Monuments"
    ],
    "technology_workspace": [
        "#WorkspaceInspo", "#MinimalDesk", "#TechSetup", "#Productivity",
        "#ModernWorkspace", "#DeskGoals", "#CleanSetup"
    ],
    "food_dining": [
        "#CulinaryArt", "#FoodieGram", "#GourmetFeast", "#TastyTreats",
        "#ChefCreation", "#PlatingArt"
    ],
    "animals_pets": [
        "#PetLovers", "#DoggoGram", "#PuppyLove", "#FurryFriend",
        "#PetLife", "#BestCompanion"
    ],
    "vehicles_transport": [
        "#CarEnthusiast", "#PrecisionEngineering", "#AutomotiveArt",
        "#SleekRides", "#Performance"
    ],
    "art_media_poster": [
        "#GraphicDesign", "#VisualDesign", "#CreativeArtwork",
        "#PosterDesign", "#BrandIdentity", "#DigitalArt"
    ]
}

TOPIC_KEYWORDS = {
    "open to work": ["#OpenToWork", "#CareerOpportunities", "#Hiring", "#JobSearch", "#JobHunt", "#AvailableForHire"],
    "opentowork": ["#OpenToWork", "#Hiring", "#JobOpportunity", "#CareerGrowth"],
    "hiring": ["#WeAreHiring", "#JoinOurTeam", "#JobOpening", "#Careers"],
    "formal": ["#ExecutiveStyle", "#ProfessionalAttire", "#BusinessFormal", "#SharpLook"],
    "suit": ["#TailoredFit", "#ExecutiveStyle", "#ProfessionalAttire", "#SharpLook", "#CorporateStyle"],
    "portrait": ["#PortraitPhotography", "#ProfessionalHeadshot", "#PersonalBrand", "#ExecutivePresence"],
    "career": ["#CareerJourney", "#CareerMilestones", "#ProfessionalGrowth", "#WorkLife"],
    "gown": ["#EveningGown", "#Couture", "#FashionStyle", "#EleganceInStyle", "#OOTD"],
    "dress": ["#DressStyle", "#FashionInspo", "#OOTD", "#Elegance"],
    "overskirt": ["#Couture", "#FashionDesign", "#RunwayStyle", "#StyleInspo"],
    "chardham": ["#ChardhamYatra", "#Himalayas", "#SpiritualJourney", "#SacredIndia", "#Devbhoomi"],
    "temple": ["#SacredPlaces", "#HeritageArchitecture", "#DivineEnergy", "#SpiritualJourney"],
    "mountain": ["#MountainLife", "#AlpineVibes", "#PeakViews", "#WildernessCulture"],
    "alp": ["#AlpineViews", "#SnowPeak", "#MountainExplorer", "#HighAltitude"],
    "sunset": ["#SunsetLovers", "#GoldenHour", "#ChasingSunsets", "#SkyPorn"],
    "beach": ["#BeachVibes", "#OceanBreeze", "#CoastlineViews", "#SaltInTheAir"],
    "ocean": ["#OceanVistas", "#DeepBlue", "#CoastalLiving", "#SeasTheDay"],
    "dog": ["#DogLovers", "#PupLife", "#DoggoGram", "#FurryFriend"],
    "cat": ["#CatLovers", "#FelineVibes", "#KittyGram", "#MeowLife"],
    "coffee": ["#CoffeeCulture", "#CaffeineFix", "#MorningRitual", "#BaristaDaily"],
    "food": ["#FoodieGram", "#CulinaryArt", "#GourmetFeast", "#TastyTreats", "#ForkYeah"],
    "laptop": ["#TechLife", "#WorkspaceGoals", "#DigitalNomad", "#RemoteWork"],
    "car": ["#CarLovers", "#SpeedAndStyle", "#AutoDaily", "#Supercar"]
}

def generate_hashtags(
    caption_text: str,
    platform: str = "instagram",
    style: str = "creative",
    audience: str = "general",
    visual_domain: Optional[str] = None,
    visual_entities: Optional[List[str]] = None,
    max_tags: int = 12
) -> List[str]:
    """
    Generates intelligent, context-aware hashtags based on the actual visual entities,
    detected domain, caption content, and target platform.
    """
    tags: List[str] = []
    seen: Set[str] = set()

    def add_tag(t: str):
        cleaned = re.sub(r"[^a-zA-Z0-9#]", "", t)
        if not cleaned.startswith("#"):
            cleaned = "#" + cleaned
        if cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            tags.append(cleaned)

    # 1. Visual Domain hashtags (high priority, guaranteed relevant)
    if visual_domain and visual_domain in DOMAIN_HASHTAGS:
        for t in DOMAIN_HASHTAGS[visual_domain][:5]:
            add_tag(t)

    # 2. Curated visual entities matching known topics
    if visual_entities:
        for entity in visual_entities:
            ent_low = entity.lower()
            for kw, kw_tags in TOPIC_KEYWORDS.items():
                if kw in ent_low:
                    for t in kw_tags[:3]:
                        add_tag(t)

    # 3. Topic detection from actual caption text
    lower_caption = caption_text.lower()
    for topic, topic_tags in TOPIC_KEYWORDS.items():
        if topic in lower_caption:
            for t in topic_tags[:3]:
                add_tag(t)

    # 4. Extract salient words (>4 chars) from caption
    words = re.findall(r"\b[a-zA-Z]{5,}\b", lower_caption)
    stop_words = {"their", "there", "where", "which", "about", "under", "after", "through", "difference", "perspective"}
    for w in words[:2]:
        if w not in stop_words:
            add_tag("#" + w.capitalize())

    # 5. Add Style hashtags
    style_key = style.lower()
    if style_key in STYLE_HASHTAGS:
        for t in STYLE_HASHTAGS[style_key][:3]:
            add_tag(t)

    # 6. Add Platform hashtags
    plat_key = platform.lower()
    if plat_key in PLATFORM_HASHTAGS:
        for t in PLATFORM_HASHTAGS[plat_key][:3]:
            add_tag(t)

    return tags[:max_tags]
