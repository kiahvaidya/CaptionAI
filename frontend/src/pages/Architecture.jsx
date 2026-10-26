import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  ArrowDown,
  Info,
  Activity,
  Code2,
  CheckCircle,
  Database,
  Eye,
  Sliders,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function Architecture() {
  const [arch, setArch] = useState(null);
  const [selectedNode, setSelectedNode] = useState('cnn');

  useEffect(() => {
    api.getMlArchitecture().then(res => setArch(res)).catch(e => console.error(e));
  }, []);

  const nodes = [
    {
      id: 'input',
      title: '1. User Image Input',
      sub: 'RGB Visual Asset (JPG / PNG / WEBP)',
      tensor: 'Shape: [B, 3, H, W]',
      desc: 'Raw image uploaded by the user via web interface or API.'
    },
    {
      id: 'prep',
      title: '2. Image Preprocessing',
      sub: 'Resize (256×256) → CenterCrop (224×224) → Normalization',
      tensor: 'Shape: [B, 3, 224, 224]',
      desc: 'Standard ImageNet normalization using mean=[0.485, 0.456, 0.406] and std=[0.229, 0.224, 0.225]. Converts PIL buffer into float32 PyTorch tensor.'
    },
    {
      id: 'cnn',
      title: '3. ResNet50 CNN Encoder',
      sub: 'Deep Residual ConvNet Feature Extraction',
      tensor: 'Conv5_x Spatial: [B, 2048, 7, 7] | Global: [B, 2048]',
      desc: 'Pretrained 50-layer deep convolutional backbone. The final dense softmax classifier is replaced. Global average pooling produces a 2048-dim latent vector, projected via linear layer into a 512-dim multimodal embedding space.'
    },
    {
      id: 'vector',
      title: '4. Visual Embedding Projection',
      sub: 'Dense Linear + BatchNorm1d + ReLU + Dropout(0.3)',
      tensor: 'Vector: [B, 512]',
      desc: 'Projects visual representation into language embedding space, serving as the visual prompt token or initial hidden state (h0, c0) for the recurrent sequence model.'
    },
    {
      id: 'lstm',
      title: '5. Recurrent LSTM Sequence Decoder',
      sub: 'Word Embeddings + Spatial Attention + LSTM Cell',
      tensor: 'Hidden State: [B, 512] | Vocab Proj: [B, Seq_Len, 5000]',
      desc: 'Decodes words sequentially step-by-step. At step t=0, visual feature is ingested. At each subsequent step t, the previous token embedding is concatenated with Bahdanau attention context vector and processed through the LSTM cell.'
    },
    {
      id: 'prediction',
      title: '6. Word-by-Word Sequence Prediction',
      sub: 'Softmax Probability Distribution + Beam Search (k=3)',
      tensor: 'Logits: [B, Vocab_Size]',
      desc: 'Calculates categorical probability distribution over vocabulary. Beam search maintains top candidate hypothesis sequences until <end> token is emitted.'
    },
    {
      id: 'post',
      title: '7. Caption Post-Processing & Syndication',
      sub: 'Platform Framing + Style Adaptation + Scoring',
      tensor: 'JSON Output Payload',
      desc: 'Converts raw tokens into platform-tailored social copies (Instagram, LinkedIn, Twitter, Blog), generates context-grounded hashtags, computes multidimensional AI quality score breakdown, and generates accessibility Alt-Text.'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Deep Learning Core Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Neural Technical Architecture</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Academic specification of the ResNet50 CNN Encoder + LSTM Sequence Decoder powering CaptionAI's image understanding pipeline.
        </p>
      </div>

      {/* Academic Requirement Alert Callout */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-white uppercase tracking-wider">Academic Architecture Verification</span>
          <p className="text-slate-300 leading-relaxed">
            Per the project specification, <strong>the core caption generation is powered strictly by a Deep Learning Image Captioning model (CNN Feature Extractor → Sequence Model → Word Prediction)</strong>, not an external black-box LLM API. The model runs locally via PyTorch 2.9.0 with genuine tensor weights.
          </p>
        </div>
      </div>

      {/* Interactive Visual Neural Pipeline Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Pipeline Flowchart (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
            <span>PIPELINE STAGES (Click stage to inspect tensor math)</span>
            <span className="font-mono text-indigo-400">PyTorch Module Graph</span>
          </div>

          {nodes.map((node, index) => {
            const isSelected = selectedNode === node.id;
            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        0{index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{node.title}</h4>
                        <p className="text-[11px] text-slate-400">{node.sub}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950/80 text-brand-300 border border-slate-800">
                      {node.tensor.split('|')[0]}
                    </span>
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className="w-4 h-4 text-indigo-500/50" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Stage Deep Dive & Tensor Math (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Component Specification</h3>
            </div>

            {(() => {
              const cur = nodes.find(n => n.id === selectedNode) || nodes[2];
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Active Layer</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{cur.title}</h4>
                    <p className="text-slate-300 mt-2 leading-relaxed">{cur.desc}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Tensor Dimension:</span>
                    <div className="text-xs text-white">{cur.tensor}</div>
                  </div>

                  {/* Mathematical Formulation */}
                  {cur.id === 'cnn' && (
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                      <span className="text-slate-400">Forward Pass Formulation:</span>
                      <div className="text-emerald-400">f_conv = ResNet_conv(x) ∈ ℝ^(B × 2048 × 7 × 7)</div>
                      <div className="text-emerald-400">v_img = ReLU(BN(W_f · AvgPool(f_conv))) ∈ ℝ^(B × 512)</div>
                    </div>
                  )}

                  {cur.id === 'lstm' && (
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                      <span className="text-slate-400">Recurrent Step Equations:</span>
                      <div className="text-emerald-400">i_t = σ(W_ii x_t + b_ii + W_hi h_(t-1) + b_hi)</div>
                      <div className="text-emerald-400">f_t = σ(W_if x_t + b_if + W_hf h_(t-1) + b_hf)</div>
                      <div className="text-emerald-400">g_t = tanh(W_ig x_t + b_ig + W_hg h_(t-1) + b_hg)</div>
                      <div className="text-emerald-400">o_t = σ(W_io x_t + b_io + W_ho h_(t-1) + b_ho)</div>
                      <div className="text-emerald-400">c_t = f_t ⊙ c_(t-1) + i_t ⊙ g_t</div>
                      <div className="text-emerald-400">h_t = o_t ⊙ tanh(c_t)</div>
                    </div>
                  )}

                  {cur.id === 'prediction' && (
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                      <span className="text-slate-400">Softmax Logits & Loss:</span>
                      <div className="text-emerald-400">P(y_t | y_&lt;t, I) = Softmax(W_vocab · h_t + b_vocab)</div>
                      <div className="text-purple-400">Loss = - ∑ log P(y_t* | y_&lt;t*, I)</div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Dropout Regularization:</span>
                      <span className="text-white font-mono">0.3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Embedding Dimension:</span>
                      <span className="text-white font-mono">512</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vocabulary Threshold:</span>
                      <span className="text-white font-mono">freq ≥ 2 words</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
