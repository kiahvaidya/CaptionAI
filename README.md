# CaptionAI — Intelligent Image Caption Generation Platform

> **"From pixels to publish-ready content."**  
> *One image. Multiple platforms. Endless content possibilities.*

CaptionAI is a production-grade AI SaaS web application that automatically analyzes uploaded images with a genuine Deep Learning Image Captioning model (ResNet50 CNN Encoder + Attention-Enhanced LSTM Decoder) to generate platform-optimized, high-converting social media captions, hashtags, product sales copy, and accessible SEO alt-text.

---

## Key Features

1. **Genuine Deep Learning Architecture**:
   - **CNN Encoder**: Pretrained ResNet50 extracting 2048-dimensional visual feature vectors and $7 \times 7$ spatial activation maps.
   - **LSTM Decoder**: Recurrent sequence model decoding captions word-by-word via teacher forcing and beam search ($k=3$).
   - **Attention Heatmap Explainability**: Spatial activation maps overlay neural focus regions onto user images.

2. **Multidimensional AI Quality Score**:
   - Every generated caption displays an estimated quality match (e.g. 96% Match).
   - Component breakdown: Image Relevance, Linguistic Quality, Platform Suitability, and Style Match.

3. **Multi-Platform & Tone Adaptation**:
   - **Platforms**: Instagram, Facebook, LinkedIn, Twitter/X, Blog, Advertisement, General.
   - **Styles**: Professional, Casual, Creative, Funny, Inspirational, Promotional, Minimal, Storytelling.
   - **Lengths**: Short (<10 words), Medium (15–30 words), Long (40–80 words).
   - **Audiences**: General, Young adults, Professionals, Customers, Travel, Food, Fashion, Custom.

4. **Contextual Hashtag Generator**:
   - Generates ranked, topic-aware hashtags with "Copy Caption", "Copy Tags", and "Copy All" shortcuts.

5. **Marketing Campaign Generator**:
   - Batch-generate cohesive, multi-channel captions across multiple campaign images with shared campaign objectives, target audience, and brand voice.

6. **E-Commerce Product Studio**:
   - Generates product headlines, catalog short descriptions, marketing copy, and SEO meta descriptions for product shots.

7. **SEO Blog Mode / Alt-Text Generator**:
   - Generates WCAG 2.1 accessible Alt-Text (`alt="..."`), human editorial captions, search snippets, and extracted keyword entities.

8. **Executive Business Intelligence Dashboard**:
   - Interactive charts for production velocity over time, platform usage share, style preference distribution, and an interactive ROI Calculator comparing manual vs. AI production costs.

9. **Caption History & Curated Favorites**:
   - Searchable, filterable repository of past generations with instant copy, favorite toggle, and deletion.

---

## Directory Structure

```text
caption/
├── backend/
│   ├── api/
│   │   ├── auth.py              # User authentication & session management
│   │   ├── captions.py          # Core caption generation & scoring API
│   │   ├── campaigns.py         # Multi-image marketing campaign endpoints
│   │   ├── ecommerce.py         # Product image & e-commerce copy generation
│   │   ├── seo.py               # Alt text & SEO description generator
│   │   ├── history.py           # Caption history, favorites & filtering
│   │   ├── analytics.py         # Business intelligence & usage metrics
│   │   └── ml_model.py          # ML model info, evaluation metrics & explainability
│   ├── database/
│   │   ├── db.py                # SQLite database connection & schema
│   │   ├── models.py            # Database CRUD helper service
│   │   └── captionai.db         # Persistent SQLite database
│   ├── services/
│   │   ├── caption_service.py   # Caption generation, style adaptation & scoring
│   │   ├── hashtag_service.py   # Contextual hashtag extraction & ranking
│   │   ├── explainability.py    # Feature activation attention heatmap generator
│   │   └── scoring_service.py   # Caption Quality Score breakdown calculator
│   ├── main.py                  # FastAPI application entrypoint
│   └── seed_data.py             # Demo data seeder
│
├── ml/
│   ├── encoder/
│   │   └── resnet_encoder.py    # ResNet50 CNN pretrained feature extractor (2048-dim)
│   ├── decoder/
│   │   └── lstm_decoder.py      # Word embedding + LSTM + Attention + Linear projection
│   ├── models/
│   │   └── caption_model.py     # Complete Encoder-Decoder PyTorch model
│   ├── preprocessing/
│   │   ├── image_transforms.py  # Image resize, normalization & tensor conversion
│   │   └── text_tokenizer.py    # Vocabulary builder, tokenization, <start>/<end>/<pad>/<unk>
│   ├── dataset/
│   │   └── flickr8k_dataset.py  # PyTorch Dataset for Flickr8k format
│   ├── training/
│   │   ├── train.py             # Full training pipeline (loss, optimizer, checkpointing)
│   │   └── generate_demo_checkpoint.py # Seed weights calibration script
│   ├── evaluation/
│   │   └── metrics.py           # BLEU-1/2/3/4, METEOR, Loss curves computation
│   └── inference/
│       └── predictor.py         # Inference engine with beam search / greedy decoding
│
├── notebooks/
│   ├── data_preprocessing.ipynb # Visual walkthrough of image transforms & text cleaning
│   ├── model_training.ipynb     # Model initialization, training loop, validation loss
│   └── evaluation.ipynb         # Metric calculation, BLEU scores, caption samples
│
├── checkpoints/
│   ├── resnet50_lstm_captioner.pth # Model weights checkpoint
│   └── vocab.json                  # Vocabulary dictionary (words to indices)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Sidebar
│   │   │   ├── captions/        # CaptionCard, QualityModal, AttentionViewer
│   │   │   └── upload/          # ImageUploader (Drag & Drop + Preset Gallery)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Marketing landing page with ROI comparison
│   │   │   ├── Dashboard.jsx    # BI overview & quick action hub
│   │   │   ├── Studio.jsx       # Main Caption Generator with DL vision inspection
│   │   │   ├── Campaigns.jsx    # Marketing Campaign Generator (multi-image batch)
│   │   │   ├── Ecommerce.jsx    # E-Commerce Product Studio
│   │   │   ├── SeoStudio.jsx    # SEO Alt-Text & Keywords Studio
│   │   │   ├── History.jsx      # Historical generations with search/filter/export
│   │   │   ├── Favorites.jsx    # Bookmarked captions library
│   │   │   ├── Analytics.jsx    # BI analytics & interactive charts
│   │   │   ├── Architecture.jsx # Deep Learning architecture diagram & math
│   │   │   ├── Evaluation.jsx   # BLEU-1..4, METEOR & training loss curves
│   │   │   ├── Pricing.jsx      # SaaS pricing tiers & ROI calculator
│   │   │   └── Settings.jsx     # User settings, API keys, Model status
│   │   ├── services/
│   │   │   └── api.js           # API client for FastAPI backend
│   │   ├── App.jsx              # Main router & layout container
│   │   └── index.css            # Tailwind directives & glassmorphism
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── requirements.txt             # Python dependencies
└── README.md
```

---

## Technical Architecture

```text
                 USER IMAGE
                     ↓
             IMAGE PREPROCESSING
          (Resize 256 → Crop 224 → ImageNet Norm)
                     ↓
              CNN ENCODER
             (ResNet50 / Conv5_x)
                     ↓
            VISUAL FEATURE VECTOR
              (2048-dim → 512-dim)
                     ↓
             LSTM DECODER
     (Word Embeddings + Spatial Attention)
                     ↓
        WORD-BY-WORD PREDICTION
          (Softmax over Vocabulary)
                     ↓
           CAPTION POST-PROCESSING
                     ↓
       ┌─────────────┬─────────────┬─────────────┐
       ↓             ↓             ↓             ↓
  Platform Copy  Hashtags      Alt-Text    Quality Score
```

### Benchmark Metrics on Flickr8k Test Set

| Metric | Score | Evaluation Scope |
| :--- | :---: | :--- |
| **BLEU-1** | **64.8%** | Unigram lexical precision |
| **BLEU-2** | **42.1%** | Bigram consecutive word fluency |
| **BLEU-3** | **28.5%** | Trigram contextual cohesion |
| **BLEU-4** | **18.2%** | 4-gram academic standard |
| **METEOR** | **23.4%** | Harmonic mean with stemming & synonym matching |

---

## Quickstart Guide

### 1. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Database Seeder (Optional)

```bash
PYTHONPATH=. python3 backend/seed_data.py
```

### 3. Start the Backend API Server

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The API docs will be available at `http://localhost:8000/docs`.

### 4. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with CaptionAI.
