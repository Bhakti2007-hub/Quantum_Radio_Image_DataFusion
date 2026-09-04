import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Eye, Maximize2, Layers } from 'lucide-react';
import { ImageAnalysisData } from '../types';
import { fetchImageAnalysis, analyzeUploadedImage } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ScatterPlot } from '../components/ScatterPlot';
import { ResearchNote } from '../components/ResearchNote';

export const ImageAnalysisPage: React.FC = () => {
  const [data, setData] = useState<ImageAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzedImage, setAnalyzedImage] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchImageAnalysis()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await analyzeUploadedImage(formData);
      setAnalyzedImage(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--forest-green)' }}>Analyzing optical image feature manifold...</div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Visual Descriptors"
          value={data.features.length}
          subtext="Spatial, color, & texture moments"
          badge="Optics"
          badgeType="sage"
          icon={<ImageIcon size={15} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Mean Edge Density"
          value={data.distributions.edge_density?.mean || 0.54}
          subtext={`Std: ±${data.distributions.edge_density?.std || 0.12}`}
          badge="Spatial"
          badgeType="green"
        />
        <MetricCard
          label="Spatial Entropy"
          value={`${data.distributions.spatial_entropy?.mean || 5.1} bits`}
          subtext="Information distribution complexity"
          badge="Texture"
          badgeType="terracotta"
        />
        <MetricCard
          label="Visual PCA Variance"
          value={`${(data.pca_projection.total_variance * 100).toFixed(1)}%`}
          subtext="Preserved by 2D visual manifold"
          badge="PCA Space"
          badgeType="mustard"
        />
      </div>

      {/* 2D PCA Visual Manifold & Interactive Image Extractor */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Optical Visual Manifold (2D PCA)</div>
              <div className="card-subtitle">Spatial contour and texture clustering</div>
            </div>
          </div>
          <ScatterPlot
            points={data.pca_projection.points}
            xLabel="PC1: Spatial Entropy & Aspect Ratio"
            yLabel="PC2: Edge Density & Color Moments"
            explainedVariance={data.pca_projection.explained_variance}
            title="Visual Signature Space"
          />
        </div>

        {/* Live Image Feature Extractor */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Interactive Optical Descriptor Extractor</div>
              <div className="card-subtitle">Upload target imagery to extract descriptors</div>
            </div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={13} />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
            {/* Image Preview */}
            <div style={{ width: '140px', height: '140px', backgroundColor: '#F0ECE1', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {previewUrl || analyzedImage?.thumbnail_b64 ? (
                <img
                  src={previewUrl || analyzedImage?.thumbnail_b64}
                  alt="Target Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  <ImageIcon size={28} style={{ margin: '0 auto 4px', opacity: 0.6 }} />
                  Upload optical target
                </div>
              )}
            </div>

            {/* Extracted Descriptors */}
            <div style={{ flex: 1 }}>
              {uploading ? (
                <div style={{ padding: '20px', color: 'var(--forest-green)', fontSize: '13px' }}>Extracting spatial moments...</div>
              ) : analyzedImage ? (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '8px' }}>
                    Dimensions: {analyzedImage.dimensions?.width} &times; {analyzedImage.dimensions?.height} px
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Edge Density:</strong> {analyzedImage.features.edge_density}
                    </div>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Aspect Ratio:</strong> {analyzedImage.features.aspect_ratio}
                    </div>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Spatial Entropy:</strong> {analyzedImage.features.spatial_entropy}
                    </div>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Texture Contrast:</strong> {analyzedImage.features.texture_contrast}
                    </div>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Color Mean (R):</strong> {analyzedImage.features.color_moment_r_mean}
                    </div>
                    <div style={{ padding: '4px 8px', backgroundColor: '#FAFAF7', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <strong>Texture Energy:</strong> {analyzedImage.features.texture_energy}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Upload a target photograph (UAV drone, aerial vehicle, surface craft) to extract edge densities, aspect ratios, RGB color moments, and spatial texture entropy.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResearchNote title="Optical Sensor Characteristics">
        {data.research_note}
      </ResearchNote>
    </div>
  );
};
